import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class OrdemServicoRepository {
  private pool?: sql.ConnectionPool;

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

  async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool) return this.pool;
    const cfg = this.getMssqlConfig();
    const pool = new sql.ConnectionPool(cfg);
    await pool.connect();
    await new sql.Request(pool).query('SELECT 1');
    this.pool = pool;
    return pool;
  }

  async queryOrdemServico(osNumero: number) {
    const pool = await this.getPool();
    const req = new sql.Request(pool);
    req.input('os', sql.Int, osNumero);
    req.timeout = 60_000;

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

    return req.query<{
      ORDEM_SERVICO: number;
      DT_EMISSAO: Date | null;
      CLI_CODIGO: number;
      CLI_NOME: string;
      CPF_CNPJ: string | null;
      FONE: string | null;
      ENDERECO_COMPLETO: string;
    }>(query);
  }
}
