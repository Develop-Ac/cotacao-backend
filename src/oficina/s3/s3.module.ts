// src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { UploadsController } from './s3.controller';
import { S3Module } from '../../storage/s3.module';

@Module({
  imports: [S3Module],
  controllers: [UploadsController],
})
export class UploadsModule {}
