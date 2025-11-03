import { Injectable } from '@nestjs/common';
import { ImagesRepository } from './img.repository';

@Injectable()
export class ImagesService {
  constructor(private readonly repo: ImagesRepository) {}

  /**
   * Retorna a lista de avarias (imagens) de um checklist.
   * Campos: fotoBase64, peca, observacoes, tipo
   */
  async listByChecklistId(checklistId: string) {
    const rows = await this.repo.listByChecklistId(checklistId);

    return {
      checklistId,
      count: rows.length,
      data: rows,
    };
  }
}
