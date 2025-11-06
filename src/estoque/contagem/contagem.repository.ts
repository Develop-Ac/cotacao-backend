import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenQueryService } from '../../shared/database/openquery/openquery.service';
import { EstoqueSaidaRow } from './contagem.types';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContagemDto } from './dto/create-contagem.dto';
import { ConferirEstoqueResponseDto } from './dto/conferir-estoque-response.dto';

/**
 * Responsável por montar o T-SQL dinâmico com OPENQUERY(CONSULTA, '...').
 * Observação: OPENQUERY exige string literal; portanto usamos um SQL externo dinâmico
 * que constrói a literal com as datas/empresa já escapadas.
 */
@Injectable()
export class EstoqueSaidasRepository {
  constructor(
    private readonly oq: OpenQueryService,
    private readonly prisma: PrismaService
  ) {}

  async fetchSaidas(params: {
    data_inicial: string; // YYYY-MM-DD
    data_final: string;   // YYYY-MM-DD
    empresa: string;      // '3' por default
  }): Promise<EstoqueSaidaRow[]> {
    const { data_inicial, data_final, empresa } = params;

    // Sanitização adicional (já validado no DTO, aqui é um "belt and suspenders"):
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data_inicial) || !/^\d{4}-\d{2}-\d{2}$/.test(data_final)) {
      throw new BadRequestException('Datas devem ser YYYY-MM-DD');
    }
    if (!/^\d+$/.test(empresa)) {
      throw new BadRequestException('Empresa inválida');
    }

    // Monta o SQL que será passado DENTRO do OPENQUERY (dialeto Firebird).
    // Atenção às aspas: dentro de uma string T-SQL, aspas simples duplicam.
    const innerSql = [
      'SELECT',
      '    EST.data,',
      '    EST.pro_codigo as COD_PRODUTO,',
      '    PRO.pro_descricao AS DESC_PRODUTO,',
      '    MC.mar_descricao,',
      '    PRO.ref_fabricante,',
      '    PRO.ref_FORNECEDOR,',
      '    PRO.localizacao AS LOCALIZACAO,',
      '    PRO.unidade,',
      '    SUM(EST.quantidade) AS QTDE_SAIDA,',
      '    MAX(PRO.estoque_disponivel) AS ESTOQUE,',
      '    MAX(PRO.estoque_reservado) as RESERVA',
      'FROM lanctos_estoque EST',
      'JOIN PRODUTOS PRO',
      '    ON (EST.pro_codigo = PRO.pro_codigo)',
      '    AND (EST.empresa = PRO.empresa)',
      'JOIN MARCAS MC',
      '    ON (MC.EMPRESA = PRO.EMPRESA)',
      '    AND (MC.MAR_CODIGO = PRO.MAR_CODIGO)',
      `WHERE EST.empresa = '${empresa}'`,
      `    AND EST.data BETWEEN '${data_inicial}' AND '${data_final}'`,
      `    AND EST.origem not in ('NFE', 'CNE')`,
      'GROUP BY',
      '    EST.data,',
      '    EST.pro_codigo,',
      '    PRO.pro_descricao,',
      '    PRO.localizacao,',
      '    PRO.unidade,',
      '    MC.mar_descricao,',
      '    PRO.ref_fabricante,',
      '    PRO.ref_FORNECEDOR',
      'ORDER BY PRO.localizacao',
    ].join('\n');

    // Agora construímos o SQL EXTERNO (T-SQL) com OPENQUERY.
    // Precisamos dobrar aspas simples do innerSql para caber numa literal T-SQL.
    const innerEscaped = innerSql.replace(/'/g, "''");

    const outerSql = `
      /* estoque-saidas OPENQUERY */
      SELECT *
      FROM OPENQUERY(CONSULTA, '${innerEscaped}');
    `;

    // Executa via .query para retornar recordset
    const rows = await this.oq.query<EstoqueSaidaRow>(outerSql, {}, { timeout: 300_000 });
    return rows;
  }

  async createContagem(createContagemDto: CreateContagemDto) {
    const { colaborador: nomeColaborador, contagem: tipoContagem, produtos, contagem_cuid } = createContagemDto;

    // Buscar o usuário pelo nome para obter o ID
    const usuario = await this.prisma.sis_usuarios.findFirst({
      where: {
        nome: nomeColaborador,
        trash: 0
      }
    });

    if (!usuario) {
      throw new BadRequestException(`Colaborador com nome "${nomeColaborador}" não encontrado`);
    }

    // Gera um CUID único se não foi fornecido
    const grupoContagem = contagem_cuid || crypto.randomUUID();

    // Usar transação para criar contagem e itens separadamente
    const contagemResult = await this.prisma.$transaction(async (tx) => {
      // Criar a contagem sem itens primeiro
      const contagem = await tx.est_contagem.create({
        data: {
          colaborador: usuario.id,
        contagem: tipoContagem,
        contagem_cuid: grupoContagem,
        liberado_contagem: tipoContagem === 1, // true se contagem for 1, false para demais valores
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          }
        }
      });

      // Verificar se já existem itens para este contagem_cuid
      const itensExistentes = await tx.est_contagem_itens.findMany({
        where: {
          contagem_cuid: grupoContagem
        }
      });

      let itens: any[] = [];

      // Só criar itens se não existirem para este grupo
      if (itensExistentes.length === 0) {
        // Criar os itens associados ao contagem_cuid
        for (const produto of produtos) {
          const item = await tx.est_contagem_itens.create({
            data: {
              contagem_cuid: grupoContagem, // Agora referencia diretamente o contagem_cuid
              data: new Date(produto.DATA),
              cod_produto: produto.COD_PRODUTO,
              desc_produto: produto.DESC_PRODUTO,
              mar_descricao: produto.MAR_DESCRICAO || null,
              ref_fabricante: produto.REF_FABRICANTE || null,
              ref_fornecedor: produto.REF_FORNECEDOR || null,
              localizacao: produto.LOCALIZACAO || null,
              unidade: produto.UNIDADE || null,
              qtde_saida: produto.QTDE_SAIDA,
              estoque: produto.ESTOQUE,
              reserva: produto.RESERVA
            }
          });
          itens.push(item);
        }
      } else {
        // Se já existem itens, buscar os existentes
        itens = itensExistentes;
      }

      return { ...contagem, itens };
    });

    return contagemResult;
  }

  async getContagensByUsuario(idUsuario: string) {
    // Verificar se o usuário existe
    const usuario = await this.prisma.sis_usuarios.findUnique({
      where: {
        id: idUsuario,
        trash: 0
      }
    });

    if (!usuario) {
      throw new BadRequestException(`Usuário com ID "${idUsuario}" não encontrado`);
    }

    // Buscar todas as contagens do usuário
    const contagens = await this.prisma.est_contagem.findMany({
      where: {
        colaborador: idUsuario
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            codigo: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Buscar os itens separadamente usando contagem_cuid
    const contagensComItens = await Promise.all(
      contagens.map(async (contagem) => {
        if (contagem.contagem_cuid) {
          const itens = await this.prisma.est_contagem_itens.findMany({
            where: {
              contagem_cuid: contagem.contagem_cuid
            },
            orderBy: {
              cod_produto: 'asc'
            }
          });
          return { ...contagem, itens };
        }
        return { ...contagem, itens: [] };
      })
    );

    return contagensComItens;
  }

  async updateItemConferir(itemId: string, conferir: boolean) {
    // Atualiza somente o campo 'conferir' do item de contagem
    const updated = await this.prisma.est_contagem_itens.update({
      where: { id: itemId },
      data: { conferir }
    });

    return updated;
  }

  async getEstoqueProduto(codProduto: number, empresa: string = '3'): Promise<ConferirEstoqueResponseDto | null> {
    // Sanitização adicional
    if (!/^\d+$/.test(empresa)) {
      throw new BadRequestException('Empresa inválida');
    }

    // Monta o SQL que será passado DENTRO do OPENQUERY (dialeto Firebird)
    const innerSql = [
      'SELECT',
      '    PRO.pro_codigo,',
      '    MAX(PRO.estoque_disponivel) AS ESTOQUE',
      'FROM lanctos_estoque EST',
      'JOIN PRODUTOS PRO',
      '    ON (EST.pro_codigo = PRO.pro_codigo)',
      '    AND (EST.empresa = PRO.empresa)',
      'JOIN MARCAS MC',
      '    ON (MC.EMPRESA = PRO.EMPRESA)',
      '    AND (MC.MAR_CODIGO = PRO.MAR_CODIGO)',
      `WHERE EST.empresa = '${empresa}'`,
      `    AND PRO.pro_codigo = ${codProduto}`,
      'GROUP BY PRO.pro_codigo'
    ].join('\n');

    // Escapa aspas simples para T-SQL
    const innerEscaped = innerSql.replace(/'/g, "''");

    const outerSql = `
      /* conferir-estoque OPENQUERY */
      SELECT *
      FROM OPENQUERY(CONSULTA, '${innerEscaped}');
    `;

    // Executa via .query para retornar recordset
    const rows = await this.oq.query<ConferirEstoqueResponseDto>(outerSql, {}, { timeout: 30_000 });
    
    return rows.length > 0 ? rows[0] : null;
  }

  async updateLiberadoContagem(contagem_cuid: string, contagem: number) {
    // Define qual contagem deve ser liberada baseada na lógica:
    // Se contagem = 1, libera contagem tipo 2
    // Se contagem = 2, libera contagem tipo 3
    const contagemParaLiberar = contagem === 1 ? 2 : 3;

    // Primeiro: coloca false na contagem atual (que veio do front)
    await this.prisma.est_contagem.updateMany({
      where: { 
        contagem_cuid: contagem_cuid,
        contagem: contagem
      },
      data: { liberado_contagem: false }
    });

    // Segundo: libera a próxima contagem (coloca true)
    const updated = await this.prisma.est_contagem.updateMany({
      where: { 
        contagem_cuid: contagem_cuid,
        contagem: contagemParaLiberar
      },
      data: { liberado_contagem: true }
    });

    if (updated.count === 0) {
      throw new BadRequestException(`Nenhuma contagem encontrada com contagem_cuid "${contagem_cuid}" e tipo ${contagemParaLiberar}`);
    }

    // Retorna a contagem liberada para confirmação
    const contagemAtualizada = await this.prisma.est_contagem.findFirst({
      where: {
        contagem_cuid: contagem_cuid,
        contagem: contagemParaLiberar
      }
    });

    return contagemAtualizada;
  }

  async getContagensByGrupo(contagem_cuid: string) {
    // Buscar todas as contagens de um grupo específico
    const contagens = await this.prisma.est_contagem.findMany({
      where: {
        contagem_cuid: contagem_cuid
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            codigo: true
          }
        }
      },
      orderBy: {
        contagem: 'asc' // Ordena por tipo: 1, 2, 3
      }
    });

    // Buscar os itens do grupo (compartilhados por todas as contagens)
    const itens = await this.prisma.est_contagem_itens.findMany({
      where: {
        contagem_cuid: contagem_cuid
      },
      orderBy: {
        cod_produto: 'asc'
      }
    });

    // Adicionar os mesmos itens a todas as contagens do grupo
    const contagensComItens = contagens.map(contagem => ({
      ...contagem,
      itens: itens
    }));

    return contagensComItens;
  }
}
