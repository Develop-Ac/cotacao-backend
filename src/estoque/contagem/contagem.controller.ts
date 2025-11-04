import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiOkResponse, 
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiExtraModels,
  ApiCreatedResponse,
  ApiParam
} from '@nestjs/swagger';
import { EstoqueSaidasService } from './contagem.service';
import { GetSaidasQueryDto } from './dto/get-saidas.query.dto';
import { EstoqueSaidaRow } from './contagem.types';
import { EstoqueSaidaResponseDto } from './dto/estoque-saida-response.dto';
import { CreateContagemDto } from './dto/create-contagem.dto';
import { ContagemResponseDto } from './dto/contagem-response.dto';

@ApiTags('Estoque')
@ApiExtraModels(GetSaidasQueryDto, EstoqueSaidaResponseDto, CreateContagemDto, ContagemResponseDto)
@Controller('contagem')
export class EstoqueSaidasController {
  constructor(private readonly service: EstoqueSaidasService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar saídas do estoque',
    description: 'Lista as movimentações de saída do estoque em um período específico para uma empresa'
  })
  @ApiQuery({
    name: 'data_inicial',
    description: 'Data inicial para consulta (formato: YYYY-MM-DD)',
    example: '2024-01-01',
    required: true,
    type: 'string'
  })
  @ApiQuery({
    name: 'data_final',
    description: 'Data final para consulta (formato: YYYY-MM-DD)',
    example: '2024-01-31',
    required: true,
    type: 'string'
  })
  @ApiQuery({
    name: 'empresa',
    description: 'Código da empresa',
    example: '3',
    required: false,
    type: 'string'
  })
  @ApiOkResponse({
    description: 'Lista de saídas do estoque retornada com sucesso',
    type: EstoqueSaidaResponseDto,
    isArray: true,
    example: [
      {
        data: '2024-01-15',
        COD_PRODUTO: 12345,
        DESC_PRODUTO: 'PRODUTO EXEMPLO ABC',
        mar_descricao: 'MARCA EXEMPLO',
        ref_fabricante: 'REF123456',
        ref_FORNECEDOR: 'FORN789',
        LOCALIZACAO: 'A01-B02',
        unidade: 'UN',
        QTDE_SAIDA: 5,
        ESTOQUE: 100,
        RESERVA: 10
      }
    ]
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros inválidos fornecidos',
    example: {
      statusCode: 400,
      message: ['data_inicial deve ser YYYY-MM-DD'],
      error: 'Bad Request'
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    example: {
      statusCode: 500,
      message: 'Erro interno do servidor'
    }
  })
  async getSaidas(@Query() q: GetSaidasQueryDto): Promise<EstoqueSaidaRow[]> {
    const { data_inicial, data_final, empresa = '3' } = q;
    return this.service.listarSaidas({ data_inicial, data_final, empresa });
  }

  @Get(':id_usuario')
  @ApiOperation({
    summary: 'Listar contagens de um usuário',
    description: 'Retorna uma lista das contagens realizadas por um usuário específico, incluindo todos os itens de cada contagem'
  })
  @ApiParam({
    name: 'id_usuario',
    description: 'ID único do usuário/colaborador',
    example: 'clx0987654321fedcba',
    type: 'string'
  })
  @ApiOkResponse({
    description: 'Lista de contagens do usuário retornada com sucesso',
    type: ContagemResponseDto,
    isArray: true,
    example: [
      {
        id: 'clx1234567890abcdef',
        colaborador: 'clx0987654321fedcba',
        contagem: 1,
        created_at: '2025-11-04T14:30:00.000Z',
        usuario: {
          id: 'clx0987654321fedcba',
          nome: 'DIOGO DA SILVA SANTOS',
          codigo: 'DS001'
        },
        itens: [
          {
            id: 'clx1111222233334444',
            contagem_id: 'clx1234567890abcdef',
            data: '2025-11-04T00:00:00.000Z',
            cod_produto: 23251,
            desc_produto: 'CAPA P/CHOQUE DIANT. S-10 12/16 PRETO LISO - DTS',
            mar_descricao: 'DTS',
            ref_fabricante: null,
            ref_fornecedor: '056597',
            localizacao: 'B1002A03',
            unidade: 'UN',
            qtde_saida: 1,
            estoque: 8,
            reserva: 2
          }
        ]
      }
    ]
  })
  @ApiBadRequestResponse({
    description: 'ID do usuário inválido ou usuário não encontrado',
    example: {
      statusCode: 400,
      message: 'Usuário com ID "invalid-id" não encontrado',
      error: 'Bad Request'
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    example: {
      statusCode: 500,
      message: 'Erro interno do servidor'
    }
  })
  async getContagensByUsuario(@Param('id_usuario') idUsuario: string): Promise<ContagemResponseDto[]> {
    return this.service.getContagensByUsuario(idUsuario);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar nova contagem de estoque',
    description: 'Registra uma nova contagem de estoque com os produtos verificados pelo colaborador'
  })
  @ApiCreatedResponse({
    description: 'Contagem criada com sucesso',
    type: ContagemResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
    example: {
      statusCode: 400,
      message: ['colaborador não deve estar vazio'],
      error: 'Bad Request'
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    example: {
      statusCode: 500,
      message: 'Erro interno do servidor'
    }
  })
  async createContagem(@Body() createContagemDto: CreateContagemDto): Promise<ContagemResponseDto> {
    return await this.service.createContagem(createContagemDto);
  }
}
