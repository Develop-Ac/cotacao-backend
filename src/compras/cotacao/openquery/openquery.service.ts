import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { OpenQueryService as MssqlOpenQuery } from '../../../shared/database/openquery/openquery.service';

type PedidoCotacaoRow = {
  pedido_cotacao: number;
  emissao: Date | string | null;
  pro_codigo: number | string | null;
  pro_descricao: string | null;
  mar_descricao: string | null;
  referencia: string | null;
  unidade: string | null;
  quantidade: number | string | null;
};

type FornecedorRow = {
  for_codigo: number | string | null;
  for_nome: string | null;
  cpf_cnpj: string | null;
  rg_ie: string | null;
  endereco: string | null;
  bairro: string | null;
  numero: string | null;
  cidade: string | null;
  uf: string | null;
  email: string | null;
  fone: string | null;
  contato: string | null;
};

/**
 * Serviço que consulta o Firebird via Linked Server (OPENQUERY [CONSULTA]),
 * utilizando o gerenciador de conexão/queries `MssqlOpenQuery`.
 */
@Injectable()
export class ConsultaOpenqueryService {
  private readonly logger = new Logger(ConsultaOpenqueryService.name);

  constructor(private readonly mssql: MssqlOpenQuery) {}

  /** Escapa aspas simples para o literal T-SQL do OPENQUERY */
  private fbLiteral(sql: string): string {
    return sql.replace(/'/g, "''");
  }

  /**
   * Busca itens de um pedido de cotação no Firebird via Linked Server (CONSULTA).
   */
  async buscarPorEmpresaPedido(empresa: number, pedido: number): Promise<PedidoCotacaoRow[]> {
    // Firebird SQL (rodará do outro lado do linked server)
    const fbSql = `
      SELECT
          orc.pedido_cotacao,
          orc.emissao,
          iorc.pro_codigo,
          pro.pro_descricao,
          mar.mar_descricao,
          pro.referencia,
          pro.unidade,
          iorc.quantidade
      FROM PEDIDOS_COTACOES orc
      LEFT JOIN PEDIDOS_COTACOES_ITENS iorc
             ON iorc.empresa = orc.empresa
            AND iorc.pedido_cotacao = orc.pedido_cotacao
      LEFT JOIN PRODUTOS pro
             ON pro.empresa = orc.empresa
            AND pro.pro_codigo = iorc.pro_codigo
      LEFT JOIN MARCAS mar
             ON mar.empresa = orc.empresa
            AND mar.mar_codigo = pro.mar_codigo
      WHERE orc.empresa = ${empresa}
        AND orc.pedido_cotacao = ${pedido}
    `;

    // T-SQL que chama o OPENQUERY
    const tsql = `SELECT * FROM OPENQUERY([CONSULTA], '${this.fbLiteral(fbSql)}')`;

    try {
      const rows = await this.mssql.query<PedidoCotacaoRow>(tsql, {}, { timeout: 60_000, allowZeroRows: true });

      // normaliza emissao para ISO string quando vier Date
      return (rows || []).map((r) => ({
        ...r,
        emissao: r?.emissao instanceof Date ? r.emissao.toISOString() : r?.emissao ?? null,
      }));
    } catch (err: any) {
      this.logger.error(
        `[OPENQUERY pedido] ${err?.message || err}`,
      );
      throw new InternalServerErrorException('Falha ao buscar pedido de cotação');
    }
  }

  /**
   * Busca dados do fornecedor por for_codigo (empresa fixa = 3).
   */
  async buscarFornecedorPorCodigo(forCodigo: number): Promise<FornecedorRow> {
    const empresa = 3; // conforme sua regra atual

    const fbSql = `
      SELECT
        fo.for_codigo,
        fo.for_nome,
        fo.cpf_cnpj,
        fo.rg_ie,
        fo.endereco,
        fo.bairro,
        fo.numero,
        fo.cidade,
        fo.uf,
        fo.email,
        fo.fone,
        fo.contato
      FROM FORNECEDORES fo
      WHERE fo.empresa = ${empresa}
        AND fo.for_codigo = ${forCodigo}
      ROWS 1
    `;

    const tsql = `SELECT * FROM OPENQUERY([CONSULTA], '${this.fbLiteral(fbSql)}')`;

    try {
      const rows = await this.mssql.query<FornecedorRow>(tsql, {}, { timeout: 60_000, allowZeroRows: true });
      const row = rows[0];
      if (!row) throw new NotFoundException('Fornecedor não encontrado.');
      return row;
    } catch (err: any) {
      if (err?.status === 404) throw err;
      this.logger.error(
        `[OPENQUERY fornecedor] ${err?.message || err}`,
      );
      throw new InternalServerErrorException('Falha ao buscar fornecedor');
    }
  }
}