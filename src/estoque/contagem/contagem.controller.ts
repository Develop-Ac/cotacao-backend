import { Controller, Get, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery, 
  ApiOkResponse, 
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiExtraModels
} from '@nestjs/swagger';
import { EstoqueSaidasService } from './contagem.service';
import { GetSaidasQueryDto } from './dto/get-saidas.query.dto';
import { EstoqueSaidaRow } from './contagem.types';
import { EstoqueSaidaResponseDto } from './dto/estoque-saida-response.dto';

@ApiTags('Estoque')
@ApiExtraModels(GetSaidasQueryDto, EstoqueSaidaResponseDto)
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
}
