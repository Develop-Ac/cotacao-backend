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
    const { colaborador: nomeColaborador, produtos, contagem_cuid } = createContagemDto;

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

    // Gera um CUID único para o grupo se não foi fornecido
    const grupoContagem = contagem_cuid || crypto.randomUUID();

    // Criar as 3 contagens (tipos 1, 2, 3) em uma transação
    const contagensResult = await this.prisma.$transaction(async (tx) => {
      const contagens: any[] = [];

      // Criar contagens tipo 1, 2 e 3
      for (let tipoContagem = 1; tipoContagem <= 3; tipoContagem++) {
        const contagem = await tx.est_contagem.create({
          data: {
            colaborador: usuario.id,
            contagem: tipoContagem,
            contagem_cuid: grupoContagem,
            liberado_contagem: tipoContagem === 1, // Apenas tipo 1 inicia liberada
            itens: {
              create: produtos.map(produto => ({
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
              }))
            }
          },
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                codigo: true
              }
            },
            itens: true
          }
        });

        contagens.push(contagem);
      }

      return contagens;
    });

    // Retorna apenas a primeira contagem (tipo 1) para manter compatibilidade
    return contagensResult[0];
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

    // Buscar todas as contagens do usuário com seus itens
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
        },
        itens: {
          orderBy: {
            cod_produto: 'asc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return contagens;
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

    // Busca e atualiza a contagem específica
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

    // Retorna a contagem atualizada para confirmação
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
        },
        itens: {
          orderBy: {
            cod_produto: 'asc'
          }
        }
      },
      orderBy: {
        contagem: 'asc' // Ordena por tipo: 1, 2, 3
      }
    });

    return contagens;
  }
}
