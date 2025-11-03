// src/uploads/uploads.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { randomBytes } from 'crypto';
import { S3Service } from '../../storage/s3.service';

function smallId(len = 12) {
  // gera um id base36 curto (estilo cuid)
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

// Bucket vem do .env (ou "avarias" por padrão)
const BUCKET = process.env.S3_BUCKET_AVARIAS || 'avarias';

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

    // 1) Normaliza para PNG e limita dimensão (heic/heif/jpg/png/webp)
    let pngBuffer: Buffer;
    try {
      pngBuffer = await sharp(file.buffer)
        .rotate() // auto-orient por EXIF
        .resize({
          width: 1280,
          height: 1280,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } catch (e) {
      // fallback: em caso de build do sharp sem libvips HEIC, mantém original
      pngBuffer = file.buffer;
    }

    // 2) Nome curto .png
    const keyName = `${smallId(12)}.png`;

    // 3) Upload para o MinIO/S3 (agora passando Bucket explicitamente)
    await this.s3.putObject({
      bucket: BUCKET,
      key: keyName,
      body: pngBuffer,
      contentType: 'image/png',
    });

    // 4) (Opcional) URL pré-assinada — só se o serviço expuser esse método
    let url: string | undefined;
    if (typeof (this.s3 as any).getPresignedGetUrl === 'function') {
      try {
        url = await (this.s3 as any).getPresignedGetUrl({
          bucket: BUCKET,
          key: keyName,
          expiresIn: 3600, // 1h
        });
      } catch {
        // ignore erros de presign
      }
    }

    // 5) Retorno: o front grava apenas fileName no banco
    return { ok: true, fileName: keyName, url };
  }

  // Endpoint opcional para gerar URL de download depois
  @Get('avarias/url')
  async presign(@Query('key') key: string) {
    if (!key) throw new BadRequestException('Informe key');
    if (typeof (this.s3 as any).getPresignedGetUrl !== 'function') {
      throw new BadRequestException('Presign indisponível no S3Service.');
    }
    const url = await (this.s3 as any).getPresignedGetUrl({
      bucket: BUCKET,
      key,
      expiresIn: 3600,
    });
    return { ok: true, url };
  }
}
