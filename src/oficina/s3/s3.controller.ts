// src/uploads/uploads.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiConsumes, 
  ApiBody, 
  ApiOkResponse, 
  ApiBadRequestResponse,
  ApiQuery,
  ApiProperty
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { randomBytes } from 'crypto';
import { S3Service } from '../../storage/s3.service';

class UploadResponseDto {
  @ApiProperty({ description: 'Status da operação', example: true })
  ok!: boolean;

  @ApiProperty({ description: 'Nome do arquivo gerado', example: 'abc123def456.png' })
  fileName!: string;

  @ApiProperty({ description: 'Chave do arquivo no bucket', example: 'abc123def456.png' })
  key!: string;

  @ApiProperty({ description: 'URL pré-assinada (quando disponível)', required: false })
  url?: string;
}

class PresignResponseDto {
  @ApiProperty({ description: 'Status da operação', example: true })
  ok!: boolean;

  @ApiProperty({ description: 'URL pré-assinada para download', example: 'https://s3.example.com/bucket/file.png?signature=...' })
  url!: string;
}

function smallId(len = 12) {
  const buf = randomBytes(len);
  return Array.from(buf, (b) => (b % 36).toString(36)).join('');
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const BUCKET = process.env.S3_BUCKET_AVARIAS || 'avarias';

@ApiTags('Oficina - Checklists')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly s3: S3Service) {}

  @Post('avarias')
  @ApiOperation({
    summary: 'Upload de imagem de avaria',
    description: 'Faz upload de uma imagem de avaria, redimensiona e armazena no S3/MinIO'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de imagem para upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPEG, PNG, WebP, HEIC, HEIF) - máximo 5MB'
        }
      },
      required: ['file']
    }
  })
  @ApiOkResponse({
    description: 'Upload realizado com sucesso',
    type: UploadResponseDto,
    example: {
      ok: true,
      fileName: 'abc123def456.png',
      key: 'abc123def456.png',
      url: 'https://s3.example.com/avarias/abc123def456.png?signature=...'
    }
  })
  @ApiBadRequestResponse({
    description: 'Erro nos dados enviados (arquivo não enviado ou tipo inválido)',
    example: { statusCode: 400, message: 'Arquivo obrigatório (campo "file")', error: 'Bad Request' }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          return cb(
            new BadRequestException('Tipo de arquivo não permitido'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvaria(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo obrigatório (campo "file")');
    }

    let pngBuffer: Buffer;
    try {
      pngBuffer = await sharp(file.buffer)
        .rotate()
        .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } catch {
      pngBuffer = file.buffer; // fallback
    }

    const keyName = `${smallId(12)}.png`; 

    await this.s3.putObject(
      keyName,
      pngBuffer,
      'image/png',
      BUCKET,
    );

    let url: string | undefined;
    if ((this.s3 as any).getPresignedGetUrl) {
      try {
        url = await (this.s3 as any).getPresignedGetUrl({
          bucket: BUCKET,
          key: keyName,
          expiresIn: 3600,
        });
      } catch {}
    }

    // >>> DEVOLVE A KEY <<<
    return { ok: true, fileName: keyName, key: keyName, url };
  }

  @Get('avarias/url')
  @ApiOperation({
    summary: 'Gerar URL pré-assinada',
    description: 'Gera uma URL pré-assinada para download de arquivo do S3/MinIO'
  })
  @ApiQuery({
    name: 'key',
    description: 'Chave do arquivo no bucket',
    example: 'abc123def456.png',
    required: true
  })
  @ApiQuery({
    name: 'expires',
    description: 'Tempo de expiração em segundos (60 a 86400)',
    example: '3600',
    required: false
  })
  @ApiOkResponse({
    description: 'URL pré-assinada gerada com sucesso',
    type: PresignResponseDto,
    example: {
      ok: true,
      url: 'https://s3.example.com/avarias/abc123def456.png?signature=...'
    }
  })
  @ApiBadRequestResponse({
    description: 'Chave não informada ou arquivo não encontrado',
    example: { statusCode: 400, message: 'Informe key', error: 'Bad Request' }
  })
  async presign(@Query('key') key: string, @Query('expires') expires?: string) {
    if (!key) throw new BadRequestException('Informe key');

    const ttl = Math.max(60, Math.min(Number(expires) || 3600, 24 * 3600)); // entre 1min e 24h

    try {
      const url = await this.s3.getPresignedGetUrl(key, ttl, this.s3.getDefaultBucket());
      return { ok: true, url };
    } catch (e: any) {
      const msg = String(e?.name || '').toLowerCase();
      const text = String(e?.message || '');

      if (msg.includes('notfound') || /NoSuchKey/i.test(text)) {
        throw new BadRequestException('Arquivo não encontrado no bucket.');
      }
      // Erros TLS/CERT
      if (/self-signed certificate|certificate/i.test(text)) {
        throw new BadRequestException('Falha de certificado TLS ao falar com o S3. Verifique o certificado do endpoint ou habilite S3_TLS_INSECURE=true temporariamente.');
      }
      throw new BadRequestException(`Falha ao gerar URL pré-assinada: ${text}`);
    }
  }
}
