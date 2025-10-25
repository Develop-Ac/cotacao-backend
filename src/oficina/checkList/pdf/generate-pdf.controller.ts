// src/oficina/checkListPdf/generate-pdf.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GenerateChecklistPdfService } from './generate-pdf.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('checklists')
@Controller('checklists')
export class GenerateChecklistPdfController {
  constructor(private readonly pdfService: GenerateChecklistPdfService) {}

  @Get(':id/pdf')
  async generate(@Param('id') id: string, @Res() res: Response) {
    const buf = await this.pdfService.generatePdfBuffer(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="checklist-${id}.pdf"`,
      'Content-Length': buf.length,
    });
    return res.send(buf);
  }
}
