import { Injectable } from '@nestjs/common';
import { EstoqueSaidasRepository } from './contagem.repository';
import { EstoqueSaidaRow } from './contagem.types';
import { CreateContagemDto } from './dto/create-contagem.dto';
import { ContagemResponseDto } from './dto/contagem-response.dto';

@Injectable()
export class EstoqueSaidasService {
  constructor(private readonly repo: EstoqueSaidasRepository) {}

  async listarSaidas(filters: {
    data_inicial: string;
    data_final: string;
    empresa: string;
  }): Promise<EstoqueSaidaRow[]> {
    return this.repo.fetchSaidas(filters);
  }

  async createContagem(createContagemDto: CreateContagemDto): Promise<ContagemResponseDto> {
    return this.repo.createContagem(createContagemDto);
  }
}
