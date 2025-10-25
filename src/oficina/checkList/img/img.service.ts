import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Retorna a lista de avarias (imagens) de um checklist.
   * Campos: fotoBase64, peca, observacoes, tipo
   */
  async listByChecklistId(checklistId: string) {
    const rows = await this.prisma.ofi_checklists_avarias.findMany({
      where: { checklistId },
      orderBy: { timestamp: 'asc' }, // opcional
      select: {
        fotoBase64: true,
        peca: true,
        observacoes: true,
        tipo: true,
      },
    });

    // Retorna sempre 200 com array (vazio se não houver)
    return {
      checklistId,
      count: rows.length,
      data: rows,
    };
  }
}
