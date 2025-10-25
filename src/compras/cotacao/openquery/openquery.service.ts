import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { ConnectionPool } from 'mssql';

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

@Injectable()
export class OpenQueryService {
  constructor(@Inject('MSSQL_POOL') private readonly pool: ConnectionPool) {}

  /**
   * Busca itens do pedido de cotação no Firebird via Linked Server (CONSULTA)
   */
  async buscarPorEmpresaPedido(empresa: number, pedido: number): Promise<PedidoCotacaoRow[]> {
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

    const tsql = `SELECT * FROM OPENQUERY([CONSULTA], '${fbSql.replace(/'/g, "''")}')`;

    try {
      const result = await this.pool.request().query<PedidoCotacaoRow>(tsql);
      return (result.recordset || []).map((r) => ({
        ...r,
        emissao: r.emissao instanceof Date ? r.emissao.toISOString() : r.emissao,
      }));
    } catch (err: any) {
      console.error('[OpenQuery][pedido] error:', {
        message: err?.message,
        number: err?.number,
        code: err?.code,
        state: err?.state,
        class: err?.class,
        lineNumber: err?.lineNumber,
      });
      throw new InternalServerErrorException('Falha ao buscar pedido de cotação');
    }
  }

  /**
   * Busca fornecedor por for_codigo (empresa fixa = 3)
   */
  async buscarFornecedorPorCodigo(forCodigo: number): Promise<FornecedorRow> {
    const empresa = 3; // fixo
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

    const tsql = `SELECT * FROM OPENQUERY([CONSULTA], '${fbSql.replace(/'/g, "''")}')`;

    try {
      const result = await this.pool.request().query<FornecedorRow>(tsql);
      const row = (result.recordset || [])[0];
      if (!row) throw new NotFoundException('Fornecedor não encontrado.');
      return row;
    } catch (err: any) {
      if (err?.status === 404) throw err;
      console.error('[OpenQuery][fornecedor by for_codigo] error:', {
        message: err?.message,
        number: err?.number,
        code: err?.code,
        state: err?.state,
        class: err?.class,
        lineNumber: err?.lineNumber,
      });
      throw new InternalServerErrorException('Falha ao buscar fornecedor');
    }
  }
}
