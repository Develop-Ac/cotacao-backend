// src/ordem-servico/ordem-servico.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as sql from 'mssql';
import { OsResponseDto } from './dto/os-response.dto';

@Injectable()
export class OrdemServicoService {
  private pool?: sql.ConnectionPool;

  // ---- Config MSSQL "openquery" embutida ----
  private getMssqlConfig(): sql.config {
    return {
      server: '192.168.1.146',
      port: 1433,
      database: 'BI',
      user: 'BI_AC',
      password: 'Ac@2025acesso',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true, 
        requestTimeout: 3_600_000, 
        cancelTimeout: 3_600_000,
        connectTimeout: 60_000, 
      },
      pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
    };
  }

  private async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool) return this.pool;
    const cfg = this.getMssqlConfig();
    const pool = new sql.ConnectionPool(cfg);
    await pool.connect();
    // teste simples
    await new sql.Request(pool).query('SELECT 1');
    this.pool = pool;
    return pool;
  }

  /**
   * Busca uma OS pelo número.
   * Ajuste o nome do schema/tabela caso necessário.
   */
  async getByNumero(osNumero: number): Promise<OsResponseDto> {
    try {
      const pool = await this.getPool();
      const req = new sql.Request(pool);
      req.input('os', sql.Int, osNumero);
      req.timeout = 60_000;

      // IMPORTANTE: esta query está em T-SQL (SQL Server).
      // Se suas tabelas estiverem em outro schema, qualifique (ex: dbo.ORDENS_SERVICO).
      const query = `
        SELECT *
        FROM OPENQUERY(
        CONSULTA,
        '
        SELECT
            OS.ORDEM_SERVICO,
            OS.DT_EMISSAO,
            OS.CLI_CODIGO,
            CLI.CLI_NOME,
            CLI.CPF_CNPJ,
            CLI.FONE,
            (COALESCE(CLI.ENDERECO, '''') || '', '' ||
            COALESCE(CLI.BAIRRO,  '''') || '', '' ||
            COALESCE(CLI.CIDADE,  '''') || '' - '' ||
            COALESCE(CLI.UF,      '''')) AS ENDERECO_COMPLETO
        FROM ORDENS_SERVICO OS
        JOIN CLIENTES CLI
            ON CLI.EMPRESA   = OS.EMPRESA
        AND CLI.CLI_CODIGO = OS.CLI_CODIGO
        WHERE OS.ORDEM_SERVICO = ${osNumero}
        '
        );
      `;

      const result = await req.query<{
        ORDEM_SERVICO: number;
        DT_EMISSAO: Date | null;
        CLI_CODIGO: number;
        CLI_NOME: string;
        CPF_CNPJ: string | null;
        FONE: string | null;
        ENDERECO_COMPLETO: string;
      }>(query);

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
