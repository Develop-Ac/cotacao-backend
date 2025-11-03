// src/ordem-servico/ordem-servico.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OrdemServicoRepository } from './ordem-servico.repository';
import { OsResponseDto } from './dto/os-response.dto';

@Injectable()
export class OrdemServicoService {
  constructor(private readonly repo: OrdemServicoRepository) {}

  /**
   * Busca uma OS pelo número.
   */
  async getByNumero(osNumero: number): Promise<OsResponseDto> {
    try {
      const result = await this.repo.queryOrdemServico(osNumero);

      const row = result.recordset?.[0];
      if (!row) throw new NotFoundException('OS não encontrada');

      return {
        ordem_servico: row.ORDEM_SERVICO,
        dt_emissao: row.DT_EMISSAO ? new Date(row.DT_EMISSAO).toISOString() : null,
        cli_codigo: row.CLI_CODIGO,
        cli_nome: row.CLI_NOME,
        cpf_cnpj: row.CPF_CNPJ ?? null,
        fone: row.FONE ?? null,
        endereco_completo: row.ENDERECO_COMPLETO ?? '',
      };
    } catch (e: any) {
      if (e?.status === 404) throw e;
      throw new InternalServerErrorException(e?.message || 'Falha na consulta de OS');
    }
  }
}
