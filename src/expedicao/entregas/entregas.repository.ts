import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../shared/database/postgres/postgres.service';

export interface EntregaRawData {
  id: number;
  cliente: string;
  status: string;
  id_entregador: number | null;
  venda: string;
  criado_em: Date;
  aceito_em: Date | null;
  disponivel_para_entrega_em: Date | null;
  saiu_para_entrega_em: Date | null;
  finalizado_em: Date | null;
  retorno_entregador_em: Date | null;
  embalado_em: Date | null;
}

@Injectable()
export class EntregasRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findAll(): Promise<EntregaRawData[]> {
    const SQL_QUERY = `
      SELECT id, cliente, status, id_entregador, venda,
             criado_em, aceito_em, disponivel_para_entrega_em,
             saiu_para_entrega_em, finalizado_em, retorno_entregador_em, embalado_em
      FROM public.exp_entregas;
    `;

    return this.postgres.query(SQL_QUERY);
  }
}