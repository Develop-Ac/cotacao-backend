import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ofi_checklistsCreateInput) {
    return this.prisma.ofi_checklists.create({ data });
  }

  count(where?: Prisma.ofi_checklistsWhereInput) {
    return this.prisma.ofi_checklists.count({ where });
  }

  findMany(params: {
    where?: Prisma.ofi_checklistsWhereInput;
    orderBy?: Prisma.ofi_checklistsOrderByWithRelationInput;
    skip?: number;
    take?: number;
    select?: Prisma.ofi_checklistsSelect;
  }) {
    return this.prisma.ofi_checklists.findMany(params);
  }

  findUnique(where: Prisma.ofi_checklistsWhereUniqueInput, include?: Prisma.ofi_checklistsInclude) {
    return this.prisma.ofi_checklists.findUnique({ where, include });
  }

  findFirst(params: { where: Prisma.ofi_checklistsWhereInput }, include?: Prisma.ofi_checklistsInclude) {
    return this.prisma.ofi_checklists.findFirst({ ...params, include });
  }

  update(where: Prisma.ofi_checklistsWhereUniqueInput, data: Prisma.ofi_checklistsUpdateInput) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('O argumento "data" está vazio ou inválido.');
    }

    // Remover campos não permitidos
    const { id, createdAt, updatedAt, ...filteredData } = data;

    return this.prisma.ofi_checklists.update({
      where,
      data: filteredData,
    });
  }

  delete(where: Prisma.ofi_checklistsWhereUniqueInput) {
    return this.prisma.ofi_checklists.delete({ where });
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  async updateChecklist(id: string, checklist: any) {
    if (!checklist || Object.keys(checklist).length === 0) {
      throw new Error('O objeto checklist está vazio ou inválido.');
    }

    // Remover campos não permitidos
    const { id: _, createdAt, updatedAt, ofi_checklists_items, ...filteredData } = checklist;

    // Transformar itens relacionados em um formato compatível com o Prisma
    if (ofi_checklists_items) {
      filteredData.ofi_checklists_items = {
        update: ofi_checklists_items.map((item: any) => ({
          where: { id: item.id },
          data: { ...item },
        })),
        create: ofi_checklists_items
          .filter((item: any) => !item.id) // Apenas itens sem ID serão criados
          .map((item: any) => ({ ...item })),
      };
    }

    return this.prisma.ofi_checklists.update({
      where: { id },
      data: filteredData,
    });
  }

  async updateChecklistItems(checklistId: string, items: any[]) {
    // Exemplo: Atualizar itens relacionados
    for (const item of items) {
      await this.prisma.ofi_checklists_items.upsert({
        where: { id: item.id },
        update: item,
        create: { ...item, checklistId },
      });
    }
  }

  async updateChecklistAvarias(checklistId: string, avarias: any[]) {
    // Exemplo: Atualizar avarias relacionadas
    for (const avaria of avarias) {
      await this.prisma.ofi_checklists_avarias.upsert({
        where: { id: avaria.id },
        update: avaria,
        create: { ...avaria, checklistId },
      });
    }
  }
}
