import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GenerateChecklistPdfRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findChecklistWithRelations(id: string) {
    return this.prisma.ofi_checklists.findUnique({
      where: { id },
      include: {
        ofi_checklists_items: { orderBy: { item: 'asc' } },
        ofi_checklists_avarias: { orderBy: { timestamp: 'asc' } },
      },
    });
  }
}
