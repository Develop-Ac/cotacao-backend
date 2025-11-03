// src/uploads/uploads.controller.ts
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
  // certifique-se de ter o @nestjs/platform-express instalado
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { randomBytes } from 'crypto';
import { S3Service } from '../../storage/s3.service';

function smallId(len = 12) {
  // gera um id base36 curto (tipo cuid)
  const buf = randomBytes(len);
  return Array.from(buf, (b) => (b % 36).toString(36)).join('');
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

@Controller('uploads')
export class UploadsController {
  constructor(private readonly s3: S3Service) {}

  @Post('avarias')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          return cb(new BadRequestException('Tipo de arquivo não permitido'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvaria(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo obrigatório (campo "file")');

    // 1) Normaliza para PNG + redimensiona para no máx. 1280px
    const pngBuffer = await sharp(file.buffer)
      .rotate() // auto-orient por EXIF
      .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
      .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    // 2) Gera nome hash curto
    const key = `${smallId(12)}.png`;

    // 3) Sobe no MinIO
    await this.s3.putObject(key, pngBuffer, 'image/png');

    // 4) (Opcional) Gera URL pré-assinada para visualização
    let url: string | undefined;
    try {
      url = await this.s3.getPresignedGetUrl(key);
    } catch {
      // se preferir, ignore erros de presign
    }

    // 5) Retorna o que o front precisa salvar
    return { ok: true, fileName: key, url };
  }

  // endpoint opcional para gerar URL pré-assinada de GET posteriormente
  @Get('avarias/url')
  async presign(@Query('key') key: string) {
    if (!key) throw new BadRequestException('Informe key');
    const url = await this.s3.getPresignedGetUrl(key);
    return { ok: true, url };
  }
}
