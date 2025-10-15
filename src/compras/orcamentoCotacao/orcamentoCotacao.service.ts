import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type StoreItemInput = {
  descricao: string;
  quantidade: number;
  valor_unitario: string | number; // pode vir "12,34" (string) ou 12.34 (number)
};

export type StoreOrcamentoCotacaoInput = {
  id: number;                 // cotacao_id
  fornecedor: string;
  observacao?: string | null;
  dados: StoreItemInput[];    // itens
};

@Injectable()
export class OrcamentoCotacaoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Converte "12,34" -> 12.34 (number) com fallback seguro */
  private parseValor(v: string | number): number {
    if (typeof v === 'number') return v;
    const num = Number((v ?? '').toString().replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(num) ? num : 0;
  }

  /** Cria os itens de orçamento para uma cotação, com mesmo orcamento_id (6 dígitos randômico) */
  async store(payload: StoreOrcamentoCotacaoInput) {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // valida existência da cotação
      const cotacao = await tx.cotacao.findUnique({ where: { id: payload.id } });
      if (!cotacao) throw new NotFoundException('Cotação não encontrada.');

      const orcamentoId = Math.floor(100000 + Math.random() * 900000);

      const data: Prisma.OrcamentoCotacaoCreateManyInput[] = payload.dados.map((i) => ({
        cotacao_id: payload.id,
        orcamento_id: orcamentoId,
        fornecedor: payload.fornecedor,
        observacao: payload.observacao ?? null,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valor_unitario: this.parseValor(i.valor_unitario),
        selecionado: false,
      }));

      if (data.length) {
        await tx.orcamentoCotacao.createMany({ data });
      }

      return { message: 'Cotação e itens salvos com sucesso.' };
    });
  }

  /** Retorna a cotação (id) com seus orçamentos */
  async getCotacaoComOrcamentos(cotacaoId: number) {
    const cotacao = await this.prisma.cotacao.findUnique({
      where: { id: cotacaoId },
      include: { orcamentos: true },
    });
    if (!cotacao) throw new NotFoundException('Cotação não encontrada.');
    return cotacao;
  }

  /** Atualiza o campo "selecionado" de um OrcamentoCotacao (pelo id do orçamento) */
  async updateSelecionado(orcamentoCotacaoId: number, selecionado: boolean) {
    const found = await this.prisma.orcamentoCotacao.findUnique({
      where: { id: orcamentoCotacaoId },
    });
    if (!found) throw new NotFoundException('Orçamento de cotação não encontrado.');

    const updated = await this.prisma.orcamentoCotacao.update({
      where: { id: orcamentoCotacaoId },
      data: { selecionado },
    });

    return {
      message: 'Status atualizado com sucesso.',
      orcamento: updated,
    };
  }
}
