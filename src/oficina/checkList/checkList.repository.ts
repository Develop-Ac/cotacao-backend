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
    return this.prisma.ofi_checklists.update({ where, data });
  }

  delete(where: Prisma.ofi_checklistsWhereUniqueInput) {
    return this.prisma.ofi_checklists.delete({ where });
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(fn);
  }

  async updateChecklist(id: string, checklist: any) {
    return this.prisma.ofi_checklists.update({
      where: { id },
      data: checklist,
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
