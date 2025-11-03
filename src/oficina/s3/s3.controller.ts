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
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { randomBytes } from 'crypto';
import { S3Service } from '../../storage/s3.service';

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

    await this.s3.putObject({
      bucket: BUCKET,
      key: keyName,
      body: pngBuffer,
      contentType: 'image/png',
    });

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
  async presign(@Query('key') key: string) {
    if (!key) throw new BadRequestException('Informe key');
    if (!(this.s3 as any).existsObject || !(this.s3 as any).getPresignedGetUrl) {
      throw new BadRequestException('Presign indisponível no S3Service.');
    }

    const exists = await (this.s3 as any).existsObject(BUCKET, key);
    if (!exists && !key.includes('.')) {
      const tryPng = `${key}.png`;
      if (await (this.s3 as any).existsObject(BUCKET, tryPng)) {
        key = tryPng;
      }
    }

    const stillExists = await (this.s3 as any).existsObject(BUCKET, key);
    if (!stillExists) throw new NotFoundException('Arquivo não encontrado.');

    const url = await (this.s3 as any).getPresignedGetUrl({
      bucket: BUCKET,
      key,
      expiresIn: 3600,
    });
    return { ok: true, url };
  }
}
