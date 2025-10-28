// src/pedido/pedido.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { Prisma } from '@prisma/client';
import { PedidoRepository } from './pedido.repository';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument = require('pdfkit');
import { OpenQueryService } from '../../../shared/database/openquery/openquery.service';

type FornecedorRow = {
  FOR_NOME: string | null;
  CELULAR: string | null;
  FONE: string | null;
  CONTATO: string | null;
  EMAIL: string | null;
};

@Injectable()
export class PedidoService {
  constructor(
    private readonly repo: PedidoRepository,
    private readonly oq: OpenQueryService,
  ) {}

  /* ----------------------- Utils ----------------------- */
  private resolveLogoPath(): string | null {
    const candidates = [
      path.resolve(process.cwd(), 'assets', 'icon-192.png'),
      path.resolve(__dirname, '..', '..', '..', 'assets', 'icon-192.png'),
      path.resolve(process.cwd(), 'src', 'assets', 'icon-192.png'),
    ];
    for (const p of candidates) if (fs.existsSync(p)) return p;
    return null;
  }

  private buildFornecedorOpenQuery(forCodigo: number): string {
    const cod = Number.isFinite(forCodigo) ? Math.trunc(forCodigo) : 0;
    const inner = `
      SELECT
        FO.FOR_NOME,
        FO.CELULAR,
        FO.FONE,
        FO.CONTATO,
        FO.EMAIL
      FROM FORNECEDORES FO
      WHERE FO.EMPRESA = 3
        AND FO.FOR_CODIGO = ${cod}
    `.replace(/\s+/g, ' ').trim();

    return `
      SELECT FO.FOR_NOME, FO.CELULAR, FO.FONE, FO.CONTATO, FO.EMAIL
      FROM OPENQUERY(CONSULTA, '${inner}')
    `;
  }

  private async getFornecedor(forCodigo: number): Promise<FornecedorRow | undefined> {
    const sql = this.buildFornecedorOpenQuery(forCodigo);
    return await this.oq.queryOne<FornecedorRow>(sql, {}, { timeout: 60_000 });
  }

  /* ----------------------- Casos de uso ----------------------- */

  async listagem() {
    const pedidos = await this.repo.findAllWithLightItens();

    const fmtBR = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return pedidos.map((p) => {
      let totalQtd = 0;
      let totalValor = 0;
      for (const it of p.itens) {
        const q = Number(it.quantidade ?? 0);
        const vu = it.valor_unitario != null ? Number(it.valor_unitario) : 0;
        totalQtd += q;
        totalValor += q * vu;
      }
      return {
        id: p.id,
        pedido_cotacao: p.pedido_cotacao,
        for_codigo: p.for_codigo,
        created_at: p.created_at,
        itens_count: p._count.itens,
        total_qtd: totalQtd,
        total_valor: totalValor,
        total_valor_fmt: `\u00A0${fmtBR.format(totalValor)}`,
      };
    });
  }

  async gerarPdfPedidoExpress(res: ExpressResponse, id: string) {
    const pedido = await this.repo.findByIdWithItens(id);
    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    const fornecedor = await this.getFornecedor(Number(pedido.for_codigo));

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    res.set('Content-Type', 'application/pdf');
    res.set(
      'Content-Disposition',
      `inline; filename="pedido_${pedido.pedido_cotacao}_id_${pedido.id}.pdf"`,
    );
    doc.pipe(res as unknown as NodeJS.WritableStream);

    const startX = doc.page.margins.left;
    const startY = doc.page.margins.top;
    const usableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const logoPath = this.resolveLogoPath();
    const logoX = startX;
    const logoY = startY;
    const logoWidth = 70;
    const logoHeight = 70;
    if (logoPath) {
      try {
        doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
      } catch {}
    }

    const title = `AC Acessórios - Pedido de Compra - ${pedido.pedido_cotacao}`;
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000');
    const titleLineH = doc.currentLineHeight();
    const logoCenterY = logoY + logoHeight / 2;
    const titleY = logoCenterY - titleLineH / 2;
    doc.text(title, startX, titleY, { width: usableWidth, align: 'center' });

    let y = Math.max(startY + logoHeight, titleY + titleLineH) + 8;

    const gutter = 16;
    const rightColWidth = 230;
    const leftColWidth = usableWidth - rightColWidth - gutter;
    const leftX = startX;

    let yLeft = y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
    doc.text('C.M. SIQUEIRA & CIA LTDA', leftX, yLeft, {
      width: leftColWidth,
      align: 'left',
    });
    yLeft += 12;

    doc.font('Helvetica').fontSize(9).fillColor('#000');
    doc.text('AVENIDA PERIMETRAL SUDESTE, 10187 - CEP: 78.896-052', leftX, yLeft, {
      width: leftColWidth,
      align: 'left',
    });
    yLeft += 12;

    doc.text('CENTRO - SORRISO - MT', leftX, yLeft, {
      width: leftColWidth,
      align: 'left',
    });
    yLeft += 12;

    if (fornecedor) {
      const linha = (valor?: string | null) => (valor ?? '').toString().trim();

      yLeft += 4;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#000');
      doc.text('FORNECEDOR', leftX, yLeft, { width: leftColWidth, align: 'left' });
      yLeft += 12;

      doc.font('Helvetica').fontSize(9).fillColor('#000');
      doc.text(linha(fornecedor.FOR_NOME), leftX, yLeft, {
        width: leftColWidth,
        align: 'left',
      });
      yLeft += 12;

      if (linha(fornecedor.CONTATO)) {
        doc.text(linha(fornecedor.CONTATO), leftX, yLeft, {
          width: leftColWidth,
          align: 'left',
        });
        yLeft += 12;
      }

      const telefones = [fornecedor.FONE, fornecedor.CELULAR]
        .filter((v) => (v ?? '').trim().length > 0)
        .join(' / ');
      if (telefones) {
        doc.text(telefones, leftX, yLeft, { width: leftColWidth, align: 'left' });
        yLeft += 12;
      }

      if ((fornecedor.EMAIL ?? '').trim()) {
        doc.text((fornecedor.EMAIL ?? '').trim(), leftX, yLeft, {
          width: leftColWidth,
          align: 'left',
        });
        yLeft += 12;
      }
    }

    y = yLeft + 12;

    const col: Record<string, number> = {
      ref: 70,
      descricao: 300,
      marca: 60,
      un: 20,
      qtd: 25,
      unit: 65,
      total: 65,
    };
    const headers = ['Ref', 'Descrição', 'Marca', 'Un', 'Qtd', 'Unit', 'Total'];

    const baseWidth = Object.values(col).reduce((a, b) => a + b, 0);
    if (baseWidth > usableWidth) {
      const scale = usableWidth / baseWidth;
      for (const k of Object.keys(col)) col[k] = Math.floor(col[k] * scale);
    }

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#333');
    let x = startX;
    headers.forEach((h, i) => {
      const w = Object.values(col)[i] as number;
      doc.text(h, x, y, { width: w, align: i >= 4 ? 'right' : 'left' });
      x += w;
    });
    y += 12;
    doc.moveTo(startX, y - 3).lineTo(startX + usableWidth, y - 3)
      .strokeColor('#CCCCCC').lineWidth(1).stroke();

    const clamp = (s: string | null | undefined, maxChars: number) => {
      const v = (s ?? '').trim();
      return v.length > maxChars ? v.slice(0, maxChars - 1) + '…' : v;
    };
    const fmtNum2 = (n: number) =>
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    const fmtQtd = (n: number) =>
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      }).format(n);

    doc.font('Helvetica').fontSize(8).fillColor('#000');
    let totalQtd = 0;
    let totalGeral = 0;

    for (const it of pedido.itens) {
      if (y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        y = doc.page.margins.top;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#333');
        x = startX;
        headers.forEach((h, i) => {
          const w = Object.values(col)[i] as number;
          doc.text(h, x, y, { width: w, align: i >= 4 ? 'right' : 'left' });
          x += w;
        });
        y += 12;
        doc.moveTo(startX, y - 3).lineTo(startX + usableWidth, y - 3)
          .strokeColor('#CCCCCC').lineWidth(1).stroke();
        doc.font('Helvetica').fontSize(8).fillColor('#000');
      }

      const qtd = Number(it.quantidade ?? 0);
      const unit = it.valor_unitario != null ? Number(it.valor_unitario) : 0;
      const linha = qtd * unit;

      totalQtd += qtd;
      totalGeral += linha;

      const row = [
        clamp(it.referencia ?? '', 18),
        clamp(it.pro_descricao, 50),
        clamp(it.mar_descricao ?? '', 15),
        clamp(it.unidade ?? '', 6),
        fmtQtd(qtd),
        unit ? fmtNum2(unit) : '',
        fmtNum2(linha),
      ];

      x = startX;
      row.forEach((txt, i) => {
        const w = Object.values(col)[i] as number;
        doc.text(txt, x, y, { width: w, align: i >= 4 ? 'right' : 'left' });
        x += w;
      });

      y += 11;
    }

    y += 6;
    doc.moveTo(startX, y - 3).lineTo(startX + usableWidth, y - 3)
      .strokeColor('#333333').lineWidth(1.2).stroke();

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000');
    y += 10;
    doc.text(`Total de Itens: ${fmtQtd(totalQtd)}`, startX, y, { align: 'left' });
    y += 12;
    doc.text(`Preço total: ${fmtNum2(totalGeral)}`, startX, y, { align: 'left' });

    doc.end();
  }

  async createOrReplace(dto: CreatePedidoDto) {
    const { pedido_cotacao, itens } = dto;

    const BASE =
      process.env.PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
      'https://intranetbackend.acacessorios.local/compras';

    const byFor: Record<number, typeof itens> = {};
    for (const it of itens) {
      const f = Number(it.for_codigo);
      if (!Number.isFinite(f)) continue;
      (byFor[f] ??= []).push(it);
    }

    const result = await this.repo.transaction(async (tx) => {
      const created: { id: string; pedido_cotacao: number; for_codigo: number }[] = [];

      for (const [forStr, grupo] of Object.entries(byFor)) {
        const for_codigo = Number(forStr);
        const pedido = await this.repo.upsertPedidoByCotacaoFornecedor(
          tx,
          pedido_cotacao,
          for_codigo,
        );

        await this.repo.deleteItensByPedidoId(tx, pedido.id);

        const data: Prisma.com_pedido_itensCreateManyInput[] = grupo.map((i) => ({
          pedido_id: pedido.id,
          item_id_origem: i.id ?? null,
          pro_codigo: i.pro_codigo,
          pro_descricao: i.pro_descricao,
          mar_descricao: i.mar_descricao ?? null,
          referencia: i.referencia ?? null,
          unidade: i.unidade ?? null,
          emissao: i.emissao ? new Date(i.emissao) : null,
          valor_unitario:
            i.valor_unitario != null ? new Prisma.Decimal(i.valor_unitario) : null,
          custo_fabrica:
            i.custo_fabrica != null ? new Prisma.Decimal(i.custo_fabrica) : null,
          preco_custo:
            i.preco_custo != null ? new Prisma.Decimal(i.preco_custo) : null,
          for_codigo,
          quantidade: new Prisma.Decimal(i.quantidade as any),
        }));

        await this.repo.createManyItens(tx, data);

        created.push({
          id: pedido.id,
          pedido_cotacao: pedido.pedido_cotacao,
          for_codigo,
        });
      }

      return created;
    });

    return {
      ok: true,
      pedidos_criados: result.length,
      pedidos: result.map((p) => ({
        ...p,
        pdf_url: `${BASE}/pedido/${p.id}`,
      })),
    };
  }
}
