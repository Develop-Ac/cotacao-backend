// src/compras/cotacao.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCotacaoDto } from './cotacao.dto';

type ListAllParams = {
  empresa?: number;
  page: number;
  pageSize: number;
  includeItems: boolean;
};

@Injectable()
export class CotacaoService {
  constructor(private prisma: PrismaService) {}

  async upsertCotacao(dto: CreateCotacaoDto) {
    const { empresa, pedido_cotacao, itens } = dto;

    const itensLower = (itens || []).map((i) => ({
      pedido_cotacao: i.PEDIDO_COTACAO,
      emissao: i.EMISSAO ? new Date(i.EMISSAO) : null,
      pro_codigo: Number(i.PRO_CODIGO),
      pro_descricao: i.PRO_DESCRICAO,
      mar_descricao: i.MAR_DESCRICAO ?? null,
      referencia: i.REFERENCIA ?? null,
      unidade: i.UNIDADE ?? null,
      quantidade: Number(i.QUANTIDADE),
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.com_cotacao.upsert({
        where: { pedido_cotacao },
        create: { empresa, pedido_cotacao },
        update: { empresa },
      });

      await tx.com_cotacao_itens.deleteMany({ where: { pedido_cotacao } });

      if (itensLower.length > 0) {
        await tx.com_cotacao_itens.createMany({ data: itensLower });
      }
    });

    return { ok: true, empresa, pedido_cotacao, total_itens: itensLower.length };
  }

  async getCotacao(empresa: number, pedido: number) {
    const header = await this.prisma.com_cotacao.findUnique({
      where: { pedido_cotacao: pedido },
      select: { empresa: true, pedido_cotacao: true },
    });

    if (!header || header.empresa !== empresa) {
      throw new NotFoundException('Pedido de cotação não encontrado.');
    }

    const itens = await this.prisma.com_cotacao_itens.findMany({
      where: { pedido_cotacao: pedido },
      orderBy: { pro_codigo: 'asc' },
    });

    const itensUpper = itens.map((r) => ({
      PEDIDO_COTACAO: r.pedido_cotacao,
      EMISSAO: r.emissao ? r.emissao.toISOString() : null,
      PRO_CODIGO: r.pro_codigo,
      PRO_DESCRICAO: r.pro_descricao,
      MAR_DESCRICAO: r.mar_descricao,
      REFERENCIA: r.referencia,
      UNIDADE: r.unidade,
      QUANTIDADE: r.quantidade,
    }));

    return {
      empresa: header.empresa,
      pedido_cotacao: header.pedido_cotacao,
      total_itens: itensUpper.length,
      itens: itensUpper,
    };
  }

  // <<< REESCRITO: sem relações >>>
  async listAll({ empresa, page, pageSize, includeItems }: ListAllParams) {
    const where = empresa != null ? { empresa } : {};

    const total = await this.prisma.com_cotacao.count({ where });

    const headers = await this.prisma.com_cotacao.findMany({
      where,
      orderBy: { pedido_cotacao: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, empresa: true, pedido_cotacao: true },
    });

    const pedidos = headers.map((h) => h.pedido_cotacao);

    // count por pedido via groupBy
    const counts = pedidos.length
      ? await this.prisma.com_cotacao_itens.groupBy({
          by: ['pedido_cotacao'],
          where: { pedido_cotacao: { in: pedidos } },
          _count: { _all: true },
        })
      : [];

    const countMap = new Map<number, number>(
      counts.map((c) => [c.pedido_cotacao, c._count._all]),
    );

    // itens (opcional) em uma query única e agrupados em memória
    let itensMap = new Map<
      number,
      Array<{
        PEDIDO_COTACAO: number;
        EMISSAO: string | null;
        PRO_CODIGO: number;
        PRO_DESCRICAO: string;
        MAR_DESCRICAO: string | null;
        REFERENCIA: string | null;
        UNIDADE: string | null;
        QUANTIDADE: number;
      }>
    >();

    if (includeItems && pedidos.length) {
      const itens = await this.prisma.com_cotacao_itens.findMany({
        where: { pedido_cotacao: { in: pedidos } },
        orderBy: [{ pedido_cotacao: 'desc' }, { pro_codigo: 'asc' }],
      });

      itensMap = itens.reduce((map, r) => {
        const arr = map.get(r.pedido_cotacao) ?? [];
        arr.push({
          PEDIDO_COTACAO: r.pedido_cotacao,
          EMISSAO: r.emissao ? r.emissao.toISOString() : null,
          PRO_CODIGO: r.pro_codigo,
          PRO_DESCRICAO: r.pro_descricao,
          MAR_DESCRICAO: r.mar_descricao,
          REFERENCIA: r.referencia,
          UNIDADE: r.unidade,
          QUANTIDADE: r.quantidade,
        });
        map.set(r.pedido_cotacao, arr);
        return map;
      }, itensMap);
    }

    const data = headers.map((h) => {
      const base = {
        empresa: h.empresa,
        pedido_cotacao: h.pedido_cotacao,
        total_itens: countMap.get(h.pedido_cotacao) ?? 0,
      };
      if (!includeItems) return base;
      return { ...base, itens: itensMap.get(h.pedido_cotacao) ?? [] };
    });

    return { total, page, pageSize, data };
  }
}
