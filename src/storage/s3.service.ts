import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as https from 'https';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly region = process.env.S3_REGION || 'us-east-1';
  private readonly endpoint = process.env.S3_ENDPOINT; // ex.: https://minio.seu.dom:9000
  private readonly forcePathStyle =
    String(process.env.S3_FORCE_PATH_STYLE ?? 'true').toLowerCase() === 'true';

  constructor() {
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
      throw new Error('S3_ACCESS_KEY/S3_SECRET_KEY ausentes.');
    }

    const insecure =
      String(process.env.S3_INSECURE_TLS ?? 'false').toLowerCase() === 'true';

    // Apenas se realmente precisar ignorar validação do cert:
    const requestHandler = insecure
      ? new NodeHttpHandler({
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        })
      : undefined;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: this.forcePathStyle,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      requestHandler, // <- usa agente inseguro só se habilitado
    });

    if (insecure) {
      this.logger.warn(
        'S3_INSECURE_TLS=true: validação de certificado TLS DESATIVADA (use apenas em DEV/HOMOLOG).',
      );
    }
  }

  async ensureBucket(bucket: string): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      this.logger.warn(`Bucket "${bucket}" não existe. Criando...`);
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket "${bucket}" criado.`);
    }
  }

  async putObject(params: {
    bucket: string;
    key: string;
    body: Buffer | Uint8Array | Blob | string;
    contentType?: string;
  }): Promise<void> {
    const { bucket, key, body, contentType } = params;
    if (!bucket) throw new Error('Bucket não informado.');
    if (!key) throw new Error('Key não informada.');

    await this.ensureBucket(bucket);

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
        ACL: 'private',
      }),
    );
  }
}
