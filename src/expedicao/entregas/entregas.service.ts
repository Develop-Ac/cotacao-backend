import { Injectable } from '@nestjs/common';
import { EntregasRepository, EntregaRawData } from './entregas.repository';
import { EntregaView } from './entregas.dto';

@Injectable()
export class EntregasService {
  constructor(private readonly repo: EntregasRepository) {}

  async findAll(): Promise<EntregaView[]> {
    const entregas = await this.repo.findAll();
    
    return entregas.map(this.mapToEntregaView);
  }

  private mapToEntregaView(raw: EntregaRawData): EntregaView {
    return {
      id: raw.id,
      cliente: raw.cliente,
      status: raw.status,
      id_entregador: raw.id_entregador,
      venda: raw.venda,
      criado_em: raw.criado_em,
      aceito_em: raw.aceito_em,
      disponivel_para_entrega_em: raw.disponivel_para_entrega_em,
      saiu_para_entrega_em: raw.saiu_para_entrega_em,
      finalizado_em: raw.finalizado_em,
      retorno_entregador_em: raw.retorno_entregador_em,
      embalado_em: raw.embalado_em,
    };
  }
}