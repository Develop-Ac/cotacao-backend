import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateItemInput = {
  cod: string;
  descricao: string;
  marca?: string | null;
  refFornecedor?: string | null; // request key (camelCase)
  unidade?: string | null;
  quantidade: number;
  valor_unitario?: number; // opcional no create
};

export type CreateCotacaoInput = {
  key: string;              // orcamento_compra
  dados: CreateItemInput[]; // itens
};

export type UpdateCotacaoInput = CreateCotacaoInput & {
  // em update, valor_unitario pode ser exigido no DTO
};

@Injectable()
export class CotacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.cotacao.findMany({
      select: { id: true, orcamento_compra: true },
      orderBy: { id: 'desc' },
    });
  }

  async create(payload: CreateCotacaoInput) {
    return this.prisma.$transaction(async (tx) => {
      const cotacao = await tx.cotacao.create({
        data: { orcamento_compra: payload.key },
      });

      if (payload.dados?.length) {
        const itemsData: Prisma.ItemCotacaoCreateManyInput[] = payload.dados.map((i) => ({
          cotacao_id: cotacao.id,
          cod: i.cod,
          descricao: i.descricao,
          marca: i.marca ?? null,
          ref_fornecedor: i.refFornecedor ?? null,
          unidade: i.unidade ?? null,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario ?? 0,
          selecionado: false,
          item_id: null,
        }));
        await tx.itemCotacao.createMany({ data: itemsData });
      }

      return { message: 'Cotação e itens salvos com sucesso.', cotacao_id: cotacao.id };
    });
  }

  async get(id: number) {
    const cotacao = await this.prisma.cotacao.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!cotacao) throw new NotFoundException('Cotação não encontrada.');
    return cotacao;
  }

  async update(id: number, payload: UpdateCotacaoInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.cotacao.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Cotação não encontrada.');

      await tx.cotacao.update({
        where: { id },
        data: { orcamento_compra: payload.key },
      });

      // Remove itens antigos e recria (espelhando seu Laravel)
      await tx.itemCotacao.deleteMany({ where: { cotacao_id: id } });

      if (payload.dados?.length) {
        const itemsData: Prisma.ItemCotacaoCreateManyInput[] = payload.dados.map((i) => ({
          cotacao_id: id,
          cod: i.cod,
          descricao: i.descricao,
          marca: i.marca ?? null,
          ref_fornecedor: i.refFornecedor ?? null,
          unidade: i.unidade ?? null,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario ?? 0,
          selecionado: false,
          item_id: null,
        }));
        await tx.itemCotacao.createMany({ data: itemsData });
      }

      return { message: 'Cotação atualizada com sucesso.', cotacao_id: id };
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      const found = await tx.cotacao.findUnique({ where: { id } });
      if (!found) throw new NotFoundException('Cotação não encontrada.');

      // Garanta deleção dos itens (se FK não está em CASCADE)
      await tx.itemCotacao.deleteMany({ where: { cotacao_id: id } });
      await tx.cotacao.delete({ where: { id } });

      return { message: 'Cotação e itens associados removidos com sucesso.' };
    });
  }
}
