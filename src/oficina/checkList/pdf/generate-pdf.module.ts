// src/oficina/checkListPdf/generate-pdf.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GenerateChecklistPdfService } from './generate-pdf.service';
import { GenerateChecklistPdfController } from './generate-pdf.controller';

@Module({
  controllers: [GenerateChecklistPdfController],
  providers: [PrismaService, GenerateChecklistPdfService],
})
export class GenerateChecklistPdfModule {}
