// src/oficina/checkListPdf/generate-pdf.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

// Alias de tipo seguro para a instância do PDFKit
type PDFDoc = InstanceType<typeof PDFDocument>;

@Injectable()
export class GenerateChecklistPdfService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Util: localizar logo e retornar Buffer ----------
  private getLogoBuffer(): Buffer | null {
    const candidates = [
      path.resolve(process.cwd(), 'public', 'icon-192.png'),
      path.resolve(process.cwd(), 'icon-192.png'),
      path.resolve(process.cwd(), 'src', 'public', 'icon-192.png'),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) return fs.readFileSync(p);
      } catch {
        // ignora e tenta o próximo
      }
    }
    return null;
  }

  private dataUrlToBuffer(dataUrlOrBase64?: string | null): Buffer | null {
    if (!dataUrlOrBase64) return null;
    if (dataUrlOrBase64.startsWith('data:')) {
      const base64 = dataUrlOrBase64.split(',')[1] ?? '';
      if (!base64) return null;
      return Buffer.from(base64, 'base64');
    }
    try {
      return Buffer.from(dataUrlOrBase64, 'base64');
    } catch {
      return null;
    }
  }

  private addSectionTitle(doc: PDFDoc, title: string, marginLeft: number) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(12).text(title, marginLeft);
    doc.moveDown(0.2);
    const y = doc.y;
    const pageWidth = doc.page.width;
    const margin = 12;
    doc
      .moveTo(margin, y)
      .lineTo(pageWidth - margin, y)
      .lineWidth(0.5)
      .strokeColor('#dddddd')
      .stroke();
    doc.moveDown(0.4);
  }

  private textLabelValue(doc: PDFDoc, label: string, value: string, x: number, y?: number) {
    if (y != null) doc.y = y;
    doc.font('Helvetica-Bold').fontSize(10).text(label, x, doc.y, { continued: true });
    doc.font('Helvetica').fontSize(10).text(value || '-');
  }

  private ensurePageSpace(doc: PDFDoc, needed: number, margin: number) {
    const bottom = doc.page.height - margin;
    if (doc.y + needed > bottom) doc.addPage();
  }

  // ====== DUAS TABELAS LADO A LADO ======
  private drawSimpleTable(
    doc: PDFDoc,
    rows: { item: string; status: string }[],
    x: number,
    yStart: number,
    tableWidth: number,
    rowH: number,
    headerH: number,
  ): number {
    // Colunas internas da tabela (Item / Status): 70% / 30%
    const colPerc = [0.7, 0.3];
    const colW = colPerc.map((p) => Math.floor(tableWidth * p));

    // Cabeçalho
    doc.rect(x, yStart, tableWidth, headerH).fill('#162032');
    doc
      .fill('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Item', x + 6, yStart + 3, { width: colW[0] - 8 })
      .text('Status', x + colW[0] + 6, yStart + 3, { width: colW[1] - 8 });
    doc.fill('#000000');

    let y = yStart + headerH;

    rows.forEach((r, idx) => {
      if (idx % 2 === 0) {
        // alterna a faixa de fundo da linha
        doc.rect(x, y, tableWidth, rowH).fill('#f5f7fa').fillColor('#000000');
      }
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(r.item || '-', x + 6, y + 3, { width: colW[0] - 8 })
        .text(r.status || '-', x + colW[0] + 6, y + 3, { width: colW[1] - 8 });
      y += rowH;
    });

    return y; // y final após a tabela
  }

  private writeTwoTablesChecklist(doc: PDFDoc, items: { item: string; status: string }[], margin: number) {
    const gap = 16;
    const usableWidth = doc.page.width - margin * 2;
    const tableWidth = (usableWidth - gap) / 2;
    const headerH = 14;
    const rowH = 12;

    // split 50/50
    const meio = Math.ceil(items.length / 2);
    const leftRows = items.slice(0, meio);
    const rightRows = items.slice(meio);

    // Altura necessária: cabeçalho + linhas do maior lado
    const maxRows = Math.max(leftRows.length, rightRows.length);
    const neededHeight = headerH + maxRows * rowH + 8; // + margem após

    this.ensurePageSpace(doc, neededHeight, margin);
    const yStart = doc.y;

    // Desenha ambas as tabelas
    const xLeft = margin;
    const xRight = margin + tableWidth + gap;

    const yEndLeft = this.drawSimpleTable(doc, leftRows, xLeft, yStart, tableWidth, rowH, headerH);
    const yEndRight = this.drawSimpleTable(doc, rightRows, xRight, yStart, tableWidth, rowH, headerH);

    // posiciona o cursor no maior Y final
    doc.y = Math.max(yEndLeft, yEndRight) + 6;
  }

  private writeAvariasTable(
    doc: PDFDoc,
    avarias: { peca?: string | null; tipo?: string | null; observacoes?: string | null }[],
    margin: number,
  ) {
    const headers = ['Peça', 'Tipo', 'Observações'];
    const colPerc = [0.25, 0.2, 0.55]; // largura relativa
    const usableWidth = doc.page.width - margin * 2;
    const colW = colPerc.map((p) => Math.floor(usableWidth * p));
    const rowH = 16;

    // Cabeçalho
    this.ensurePageSpace(doc, rowH, margin);
    const headerY = doc.y;
    doc.rect(margin, headerY, usableWidth, rowH).fill('#162032');
    doc
      .fill('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(headers[0], margin + 6, headerY + 4, { width: colW[0] - 8 })
      .text(headers[1], margin + colW[0] + 6, headerY + 4, { width: colW[1] - 8 })
      .text(headers[2], margin + colW[0] + colW[1] + 6, headerY + 4, { width: colW[2] - 8 });
    doc.fill('#000000');
    doc.y = headerY + rowH;

    // Linhas
    avarias.forEach((av, idx) => {
      this.ensurePageSpace(doc, rowH, margin);
      const y = doc.y;

      if (idx % 2 === 0) {
        doc.rect(margin, y, usableWidth, rowH).fill('#f5f7fa').fillColor('#000000');
      }

      doc
        .font('Helvetica')
        .fontSize(9)
        .text(av.peca || '-', margin + 6, y + 4, { width: colW[0] - 8 })
        .text(av.tipo || '-', margin + colW[0] + 6, y + 4, { width: colW[1] - 8 })
        .text(av.observacoes || '-', margin + colW[0] + colW[1] + 6, y + 4, {
          width: colW[2] - 8,
        });

      doc.y = y + rowH;
    });

    doc.moveDown(0.5);
  }

  private drawSignaturesFooter(doc: PDFDoc, clienteImg: Buffer | null, respImg: Buffer | null, margin: number) {
    const boxW = 160;
    const boxH = 60;

    this.ensurePageSpace(doc, boxH + 24, margin);

    const yStart = doc.y + 8;

    // Cliente (ESQUERDA)
    doc.rect(margin, yStart, boxW, boxH).stroke('#cccccc');
    if (clienteImg) {
      doc.image(clienteImg, margin + 8, yStart + 6, {
        width: boxW - 16,
        height: boxH - 24,
        fit: [boxW - 16, boxH - 24],
      });
    }
    doc.font('Helvetica').fontSize(9).text('Cliente', margin, yStart + boxH + 6, {
      align: 'left',
      width: boxW,
    });

    // Responsável (DIREITA)
    const rightX = doc.page.width - margin - boxW;
    doc.rect(rightX, yStart, boxW, boxH).stroke('#cccccc');
    if (respImg) {
      doc.image(respImg, rightX + 8, yStart + 6, {
        width: boxW - 16,
        height: boxH - 24,
        fit: [boxW - 16, boxH - 24],
      });
    }
    doc.font('Helvetica').fontSize(9).text('Responsável', rightX, yStart + boxH + 6, {
      align: 'right',
      width: boxW,
    });

    doc.moveDown(2);
  }

  async generatePdfBuffer(id: string): Promise<Buffer> {
    const c = await this.prisma.ofi_checklists.findUnique({
      where: { id },
      include: {
        ofi_checklists_items: true,
        ofi_checklists_avarias: true,
      },
    });
    if (!c) throw new NotFoundException('Checklist não encontrado');

    const doc = new PDFDocument({ size: 'A4', margin: 12 });
    const chunks: Buffer[] = [];
    const bufferPromise = new Promise<Buffer>((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const margin = 12;

    // =============================
    // Cabeçalho com LOGO + TÍTULO (título centralizado verticalmente)
    // =============================
    const logo = this.getLogoBuffer();
    const headerY = doc.y; // geralmente = margin

    const title = 'Checklist de Entrada de Veículo – AC';
    const titleFontSize = 14;
    const logoSize = 28; // caixa quadrada conhecida para facilitar centragem
    const gap = 8;

    let headerBlockHeight = 0;

    // Desenha logo à esquerda dentro de uma caixa conhecida (fit) => altura conhecida (logoSize)
    if (logo) {
      doc.image(logo, margin, headerY, { fit: [logoSize, logoSize] });
      headerBlockHeight = Math.max(headerBlockHeight, logoSize);
    }

    // Medidas do título
    doc.font('Helvetica-Bold').fontSize(titleFontSize);
    const titleX = margin + (logo ? logoSize + gap : 0);
    const titleWidth = doc.page.width - titleX - margin;

    // Altura do título (pode variar se quebrar linha)
    const titleHeight = doc.heightOfString(title, { width: titleWidth });

    // Calcula Y do título para centralizar verticalmente em relação à altura da logo (ou do próprio título se não houver logo)
    const referenceHeight = logo ? logoSize : titleHeight;
    const yTitle = headerY + (referenceHeight - titleHeight) / 2;

    // Desenha o título alinhado à esquerda, centralizado verticalmente
    doc.text(title, titleX, yTitle, { width: titleWidth, align: 'left' });

    // Altura total do bloco do cabeçalho
    headerBlockHeight = Math.max(headerBlockHeight, titleHeight);

    // Avança o cursor após o cabeçalho e traça a linha
    doc.y = headerY + headerBlockHeight + 6;
    doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineWidth(0.5)
      .strokeColor('#dddddd')
      .stroke();
    doc.moveDown(0.6);

    // =============================
    // (REMOVIDO) "Gerado em: ..."
    // =============================

    // Identificação
    this.addSectionTitle(doc, 'Identificação', margin);
    const y0 = doc.y;
    this.textLabelValue(doc, 'O.S Interna: ', c.osInterna || '-', margin, y0);
    this.textLabelValue(
      doc,
      'Data/Hora Entrada: ',
      c.dataHoraEntrada ? new Date(c.dataHoraEntrada).toLocaleString('pt-BR') : '-',
      margin + 240,
      y0,
    );

    const y1 = doc.y + 2;
    this.textLabelValue(doc, 'Cliente: ', c.clienteNome || '-', margin, y1);
    this.textLabelValue(doc, 'Doc: ', c.clienteDoc || '-', margin + 240, y1);

    const y2 = doc.y + 2;
    this.textLabelValue(doc, 'Telefone: ', c.clienteTel || '-', margin, y2);
    this.textLabelValue(doc, 'Endereço: ', c.clienteEnd || '-', margin + 240, y2);

    const y3 = doc.y + 2;
    this.textLabelValue(doc, 'Veículo: ', c.veiculoNome || '-', margin, y3);
    this.textLabelValue(doc, 'Placa: ', c.veiculoPlaca || '-', margin + 240, y3);

    const y4 = doc.y + 2;
    this.textLabelValue(doc, 'Cor: ', c.veiculoCor || '-', margin, y4);
    this.textLabelValue(doc, 'KM: ', c.veiculoKm != null ? String(c.veiculoKm) : '-', margin + 240, y4);
    doc.moveDown(1);

    // Combustível
    this.addSectionTitle(doc, 'Nível de Combustível', margin);
    doc.font('Helvetica').fontSize(10).text(`Percentual: ${c.combustivelPercentual ?? 0}%`, margin);
    doc.moveDown(0.8);

    // Checklist (DUAS TABELAS)
    this.addSectionTitle(doc, 'Checklist de Itens', margin);
    const checklist = (c.ofi_checklists_items || []).map((i) => ({ item: i.item, status: i.status }));
    if (checklist.length) {
      this.writeTwoTablesChecklist(doc, checklist, margin);
    } else {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#555').text('Sem itens informados.', margin);
      doc.fillColor('#000');
      doc.moveDown(0.6);
    }

    // Avarias
    this.addSectionTitle(doc, 'Avarias Registradas', margin);
    const avariasLite = (c.ofi_checklists_avarias || []).map((a) => ({
      peca: a.peca ?? '',
      tipo: a.tipo ?? '',
      observacoes: a.observacoes ?? '',
    }));
    if (avariasLite.length) {
      this.writeAvariasTable(doc, avariasLite, margin);
    } else {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#555').text('Sem avarias.', margin);
      doc.fillColor('#000');
      doc.moveDown(0.6);
    }

    // Observações
    if (c.observacoes) {
      this.addSectionTitle(doc, 'Observações', margin);
      doc.font('Helvetica').fontSize(10).text(c.observacoes, {
        width: doc.page.width - margin * 2,
      });
      doc.moveDown(0.6);
    }

    // Assinaturas (rodapé)
    const imgCliente = this.dataUrlToBuffer((c as any).assinaturasclienteBase64);
    const imgResp = this.dataUrlToBuffer((c as any).assinaturasresponsavelBase64);
    this.addSectionTitle(doc, 'Assinaturas', margin);
    this.drawSignaturesFooter(doc, imgCliente, imgResp, margin);

    // Numeração de páginas
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - 16;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#777')
        .text(`Página ${i + 1} de ${range.count}`, doc.page.width - margin, bottom, {
          align: 'right',
        });
      doc.fillColor('#000');
    }

    doc.end();
    return bufferPromise;
  }
}
