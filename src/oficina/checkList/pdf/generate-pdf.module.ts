// src/oficina/checkListPdf/generate-pdf.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GenerateChecklistPdfService } from './generate-pdf.service';
import { GenerateChecklistPdfController } from './generate-pdf.controller';
import { GenerateChecklistPdfRepository } from './generate-pdf.repository';

@Module({
  controllers: [GenerateChecklistPdfController],
  providers: [PrismaService, GenerateChecklistPdfService, GenerateChecklistPdfRepository],
  exports: [GenerateChecklistPdfService, GenerateChecklistPdfRepository],
})
export class GenerateChecklistPdfModule {}
