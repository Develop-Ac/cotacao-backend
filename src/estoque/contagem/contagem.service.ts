import { Injectable } from '@nestjs/common';
import { EstoqueSaidasRepository } from './contagem.repository';
import { EstoqueSaidaRow } from './contagem.types';
import { CreateContagemDto } from './dto/create-contagem.dto';
import { ContagemResponseDto } from './dto/contagem-response.dto';
import { ConferirEstoqueResponseDto } from './dto/conferir-estoque-response.dto';

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

  async getContagensByUsuario(idUsuario: string): Promise<ContagemResponseDto[]> {
    return this.repo.getContagensByUsuario(idUsuario);
  }

  async updateItemConferir(itemId: string, conferir: boolean) {
    return this.repo.updateItemConferir(itemId, conferir);
  }

  async getEstoqueProduto(codProduto: number, empresa?: string): Promise<ConferirEstoqueResponseDto | null> {
    return this.repo.getEstoqueProduto(codProduto, empresa);
  }

  async updateLiberadoContagem(contagem_cuid: string, contagem: number) {
    return this.repo.updateLiberadoContagem(contagem_cuid, contagem);
  }

  async getContagensByGrupo(contagem_cuid: string): Promise<ContagemResponseDto[]> {
    return this.repo.getContagensByGrupo(contagem_cuid);
  }
}
