// src/cotacao/cotacao.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { CotacaoService } from './cotacao.service';
import { ItemDto, CreateCotacaoDto, UpdateCotacaoDto, CotacaoItemView, CotacaoView } from './cotacao.dto';

// ---------- Controller ----------
@ApiTags('Cotações')
@ApiExtraModels(ItemDto, CreateCotacaoDto, UpdateCotacaoDto, CotacaoItemView, CotacaoView)
@Controller('cotacoes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CotacaoController {
  constructor(private readonly service: CotacaoService) {}

  // GET /cotacoes
  @Get()
  @ApiOperation({ summary: 'Lista cotações' })
  @ApiOkResponse({
    description: 'Lista de cotações',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CotacaoView) },
      example: [
        {
          id: 101,
          key: 'ORC-2025-001234',
          dados: [
            {
              cod: 'HLX-2016-BP',
              descricao: 'Grade frontal Hilux Black Piano 2016/2020',
              marca: 'ACRART',
              refFornecedor: 'AR-7789',
              unidade: 'PC',
              quantidade: 2,
              valor_unitario: 499.9
            }
          ],
          criadoEm: '2025-10-15T12:00:00.000Z',
          atualizadoEm: '2025-10-15T12:00:00.000Z'
        },
        {
          id: 102,
          key: 'ORC-2025-001235',
          dados: [],
          criadoEm: '2025-10-15T12:30:00.000Z',
          atualizadoEm: '2025-10-15T12:30:00.000Z'
        }
      ],
    },
  })
  async index() {
    return this.service.list();
  }

  // POST /cotacoes
  @Post()
  @ApiOperation({ summary: 'Cria cotação' })
  @ApiBody({
    description: 'Payload para criação de cotação',
    // API antiga do @nestjs/swagger: usar schema + examples
    schema: { allOf: [{ $ref: getSchemaPath(CreateCotacaoDto) }] },
    examples: {
      Minimal: {
        summary: 'Exemplo mínimo',
        value: {
          key: 'ORC-2025-001234',
          dados: [
            {
              cod: 'HLX-2016-BP',
              descricao: 'Grade frontal Hilux Black Piano 2016/2020',
              quantidade: 2
            }
          ]
        },
      },
      Completo: {
        summary: 'Exemplo completo',
        value: {
          key: 'ORC-2025-001234',
          dados: [
            {
              cod: 'HLX-2016-BP',
              descricao: 'Grade frontal Hilux Black Piano 2016/2020',
              marca: 'ACRART',
              refFornecedor: 'AR-7789',
              unidade: 'PC',
              quantidade: 2,
              valor_unitario: 499.9
            },
            {
              cod: 'LED-H7-U',
              descricao: 'Lâmpada LED H7 Ultra',
              marca: 'OSRAM',
              unidade: 'PC',
              quantidade: 4,
              valor_unitario: 129.9
            }
          ]
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Cotação criada',
    schema: {
      $ref: getSchemaPath(CotacaoView),
      example: {
        id: 101,
        key: 'ORC-2025-001234',
        dados: [
          {
            cod: 'HLX-2016-BP',
            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
            marca: 'ACRART',
            refFornecedor: 'AR-7789',
            unidade: 'PC',
            quantidade: 2,
            valor_unitario: 499.9
          }
        ],
        criadoEm: '2025-10-15T12:00:00.000Z',
        atualizadoEm: '2025-10-15T12:00:00.000Z'
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido',
    schema: {
      example: {
        statusCode: 400,
        message: ['dados must be an array', 'key should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async store(@Body() dto: CreateCotacaoDto) {
    return this.service.create(dto);
  }

  // GET /cotacoes/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtém cotação por ID' })
  @ApiParam({ name: 'id', example: 101 })
  @ApiOkResponse({
    description: 'Cotação encontrada',
    schema: {
      $ref: getSchemaPath(CotacaoView),
      example: {
        id: 101,
        key: 'ORC-2025-001234',
        dados: [
          {
            cod: 'HLX-2016-BP',
            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
            marca: 'ACRART',
            refFornecedor: 'AR-7789',
            unidade: 'PC',
            quantidade: 2,
            valor_unitario: 499.9
          }
        ],
        criadoEm: '2025-10-15T12:00:00.000Z',
        atualizadoEm: '2025-10-15T12:00:00.000Z'
      },
    },
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  // PUT /cotacoes/:id
  @Put(':id')
  @ApiOperation({ summary: 'Atualiza cotação' })
  @ApiParam({ name: 'id', example: 101 })
  @ApiBody({
    description: 'Payload para atualização (mesma estrutura do create)',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateCotacaoDto) }] },
    examples: {
      AjusteQuantidade: {
        value: {
          key: 'ORC-2025-001234',
          dados: [
            { cod: 'HLX-2016-BP', descricao: 'Grade frontal Hilux Black Piano 2016/2020', quantidade: 3 }
          ]
        }
      },
      AtualizacaoCompleta: {
        value: {
          key: 'ORC-2025-001234',
          dados: [
            {
              cod: 'LED-H7-U',
              descricao: 'Lâmpada LED H7 Ultra',
              marca: 'OSRAM',
              unidade: 'PC',
              quantidade: 6,
              valor_unitario: 129.9
            }
          ]
        }
      }
    },
  })
  @ApiOkResponse({
    description: 'Cotação atualizada',
    schema: {
      $ref: getSchemaPath(CotacaoView),
      example: {
        id: 101,
        key: 'ORC-2025-001234',
        dados: [
          {
            cod: 'HLX-2016-BP',
            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
            marca: 'ACRART',
            refFornecedor: 'AR-7789',
            unidade: 'PC',
            quantidade: 3,
            valor_unitario: 499.9
          }
        ],
        criadoEm: '2025-10-15T12:00:00.000Z',
        atualizadoEm: '2025-10-15T12:45:00.000Z'
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cotação não encontrada',
    schema: { example: { statusCode: 404, message: 'Cotação não encontrada' } },
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCotacaoDto) {
    return this.service.update(id, dto);
  }

  // DELETE /cotacoes/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Remove cotação por ID' })
  @ApiParam({ name: 'id', example: 101 })
  @ApiResponse({ status: 204, description: 'Removida com sucesso (No Content)' })
  @ApiResponse({
    status: 404,
    description: 'Cotação não encontrada',
    schema: { example: { statusCode: 404, message: 'Cotação não encontrada' } },
  })
  async destroy(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
