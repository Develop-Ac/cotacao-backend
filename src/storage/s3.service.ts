// src/storage/s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly getUrlTtl: number;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT!;
    this.region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY!;
    const secretAccessKey = process.env.S3_SECRET_KEY!;
    this.bucket = process.env.S3_BUCKET_AVARIAS!;
    this.getUrlTtl = Number(process.env.S3_GET_URL_TTL || 86400);

    this.client = new S3Client({
      region: this.region,
      endpoint,
      forcePathStyle: true, // MinIO recomenda path-style
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async putObject(key: string, body: Buffer, contentType: string) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await this.client.send(cmd);
    return { bucket: this.bucket, key };
  }

  async headObject(key: string) {
    const cmd = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
    return this.client.send(cmd);
  }

  async getPresignedGetUrl(key: string, expiresSeconds?: number) {
    const cmd = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
    // Apenas para verificar se existe; se não quiser, pode pular
    await this.client.send(cmd);

    const signedUrl = await getSignedUrl(
      this.client as any,
      // usamos um GET "virtual" via presigner; HeadObject também serve, mas queremos download:
      // truque: reutilizamos PutObject/Head? Melhor: gerar URL manualmente com GetObjectCommand:
      new (require('@aws-sdk/client-s3').GetObjectCommand)({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn: expiresSeconds ?? this.getUrlTtl },
    );
    return signedUrl;
  }
}