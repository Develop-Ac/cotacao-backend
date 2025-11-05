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
    const result = await this.repo.createContagem(createContagemDto);
    if (!result.contagem_cuid) {
      throw new Error('Contagem CUID não pode ser nulo');
    }
    return result as ContagemResponseDto;
  }

  async getContagensByUsuario(idUsuario: string): Promise<ContagemResponseDto[]> {
    const contagens = await this.repo.getContagensByUsuario(idUsuario);
    return contagens.filter(contagem => contagem.contagem_cuid !== null) as ContagemResponseDto[];
  }

  async updateItemConferir(itemId: string, conferir: boolean) {
    return this.repo.updateItemConferir(itemId, conferir);
  }

  async getEstoqueProduto(codProduto: number, empresa?: string): Promise<ConferirEstoqueResponseDto | null> {
    return this.repo.getEstoqueProduto(codProduto, empresa);
  }

  async updateLiberadoContagem(contagemId: string, liberado: boolean) {
    return this.repo.updateLiberadoContagem(contagemId, liberado);
  }
}
