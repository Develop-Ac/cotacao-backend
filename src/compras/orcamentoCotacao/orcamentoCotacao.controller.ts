// src/orcamento-cotacao/orcamentoCotacao.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { OrcamentoCotacaoService } from './orcamentoCotacao.service';
import {
  StoreItemDto,
  StoreOrcamentoCotacaoDto,
  UpdateSelecionadoDto,
  OrcamentoItemView,
  OrcamentoView,
  CotacaoComOrcamentosView,
} from './orcamentoCotacao.dto';

@ApiTags('Orçamentos da Cotação')
@ApiExtraModels(
  StoreItemDto,
  StoreOrcamentoCotacaoDto,
  UpdateSelecionadoDto,
  OrcamentoItemView,
  OrcamentoView,
  CotacaoComOrcamentosView,
)
@Controller('orcamentos-cotacao')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrcamentoCotacaoController {
  constructor(private readonly service: OrcamentoCotacaoService) {}

  /**
   * POST /orcamentos-cotacao
   * Body: { id (cotacao_id), fornecedor, observacao?, dados: [{descricao, quantidade, valor_unitario}] }
   */
  @Post()
  @ApiOperation({ summary: 'Cria um orçamento para uma cotação existente' })
  @ApiBody({
    description: 'Dados do orçamento',
    schema: { allOf: [{ $ref: getSchemaPath(StoreOrcamentoCotacaoDto) }] },
    examples: {
      Minimo: {
        summary: 'Exemplo mínimo',
        value: {
          id: 101,
          fornecedor: 'Fornecedor X',
          dados: [
            { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: '129,90' }
          ]
        },
      },
      Completo: {
        summary: 'Exemplo completo',
        value: {
          id: 101,
          fornecedor: 'Fornecedor Y',
          observacao: 'Entrega em 7 dias • Garantia 6 meses',
          dados: [
            { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9 },
            { descricao: 'Kit Palheta Silicone 26"', quantidade: 2, valor_unitario: 89.9 }
          ]
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Orçamento criado',
    schema: {
      $ref: getSchemaPath(OrcamentoView),
      example: {
        id: 555,
        fornecedor: 'Fornecedor X',
        observacao: 'Entrega em 7 dias',
        selecionado: false,
        dados: [
          { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 }
        ],
        total: 519.6,
        criadoEm: '2025-10-15T12:10:00.000Z',
        atualizadoEm: '2025-10-15T12:10:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido',
    schema: {
      example: {
        statusCode: 400,
        message: ['id must be an integer number', 'dados must be an array'],
        error: 'Bad Request',
      },
    },
  })
  async store(@Body() dto: StoreOrcamentoCotacaoDto) {
    return this.service.store(dto);
  }

  /**
   * GET /orcamentos-cotacao/:id
   * Retorna a cotação (id) com seus orçamentos
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtém a cotação com seus orçamentos' })
  @ApiParam({ name: 'id', example: 101, description: 'cotacao_id' })
  @ApiOkResponse({
    description: 'Cotação encontrada',
    schema: {
      $ref: getSchemaPath(CotacaoComOrcamentosView),
      example: {
        id: 101,
        key: 'ORC-2025-001234',
        orcamentos: [
          {
            id: 555,
            fornecedor: 'Fornecedor X',
            observacao: 'Entrega em 7 dias',
            selecionado: false,
            dados: [
              { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 },
              { descricao: 'Kit Palheta Silicone 26"', quantidade: 2, valor_unitario: 89.9, total_item: 179.8 }
            ],
            total: 699.4,
            criadoEm: '2025-10-15T12:10:00.000Z',
            atualizadoEm: '2025-10-15T12:10:00.000Z',
          }
        ],
        criadoEm: '2025-10-15T12:00:00.000Z',
        atualizadoEm: '2025-10-15T12:45:00.000Z'
      },
    },
  })
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCotacaoComOrcamentos(id);
  }

  /**
   * PATCH /orcamentos-cotacao/:id
   * Atualiza "selecionado" do orçamento com id = :id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza flag "selecionado" de um orçamento' })
  @ApiParam({ name: 'id', example: 555, description: 'orçamento_id' })
  @ApiBody({
    description: 'Definição da flag selecionado',
    schema: { allOf: [{ $ref: getSchemaPath(UpdateSelecionadoDto) }] },
    examples: {
      Selecionar: { value: { selecionado: true } },
      Desmarcar: { value: { selecionado: false } },
    },
  })
  @ApiOkResponse({
    description: 'Orçamento atualizado',
    schema: {
      $ref: getSchemaPath(OrcamentoView),
      example: {
        id: 555,
        fornecedor: 'Fornecedor X',
        observacao: 'Entrega em 7 dias',
        selecionado: true,
        dados: [
          { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 }
        ],
        total: 519.6,
        criadoEm: '2025-10-15T12:10:00.000Z',
        atualizadoEm: '2025-10-15T12:20:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Orçamento não encontrado',
    schema: { example: { statusCode: 404, message: 'Orçamento não encontrado' } },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSelecionadoDto,
  ) {
    return this.service.updateSelecionado(id, dto.selecionado);
  }
}
