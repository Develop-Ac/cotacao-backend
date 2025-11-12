import { Injectable } from '@nestjs/common';
import { NotaFiscalRepository } from './notaFiscal.repository';

@Injectable()
export class NotaFiscalService {
  constructor(private readonly notaFiscalRepository: NotaFiscalRepository) {}

  async getNfeDistribuicao() {
    return this.notaFiscalRepository.fetchNfeDistribuicao();
  }
}