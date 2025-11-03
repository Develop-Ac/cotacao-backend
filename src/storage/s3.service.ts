// src/storage/s3.service.ts
import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as https from 'https';

type PutObjectParams = {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | Blob | string;
  contentType?: string;
};

type PresignParams = {
  bucket: string;
  key: string;
  expiresIn?: number; // segundos (default 3600)
};

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly region = process.env.S3_REGION || 'us-east-1';
  private readonly endpoint = process.env.S3_ENDPOINT; // ex.: http://minio:9000 ou https://s3-acesso...
  private readonly forcePathStyle =
    String(process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() === 'true';

  constructor() {
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      throw new Error('S3_ACCESS_KEY/S3_SECRET_KEY ausentes.');
    }

    const insecure =
      String(process.env.S3_INSECURE_TLS ?? 'false').toLowerCase() === 'true';

    const requestHandler = insecure
      ? new NodeHttpHandler({
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        })
      : undefined;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,       // necessário p/ MinIO
      forcePathStyle: this.forcePathStyle, // necessário p/ MinIO
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      requestHandler,
    });

    if (insecure) {
      this.logger.warn(
        'S3_INSECURE_TLS=true: validação de certificado TLS DESATIVADA (use apenas em DEV/HOMOLOG).',
      );
    }
  }

  /** Garante que o bucket exista. */
  async ensureBucket(bucket: string): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      this.logger.warn(`Bucket "${bucket}" não existe. Criando...`);
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket "${bucket}" criado.`);
    }
  }

  /** Upload simples. */
  async putObject({ bucket, key, body, contentType }: PutObjectParams): Promise<void> {
    if (!bucket) throw new Error('Bucket não informado.');
    if (!key) throw new Error('Key não informada.');

    await this.ensureBucket(bucket);

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
        ACL: 'private', // ajuste se quiser público
      }),
    );
  }

  /** Gera URL pré-assinada de GET. */
  async getPresignedGetUrl({ bucket, key, expiresIn = 3600 }: PresignParams): Promise<string> {
    if (!bucket) throw new Error('Bucket não informado.');
    if (!key) throw new Error('Key não informada.');

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(this.client, cmd, { expiresIn });
    return url;
  }
}
