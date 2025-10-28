import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto } from './fornecedor.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cotação de Pedidos')
@Controller('fornecedor')
export class FornecedorController {
  constructor(private readonly service: FornecedorService) {}

  @Post()
  @ApiOperation({ summary: 'Cria ou atualiza fornecedor' })
  async create(@Body() dto: CreateFornecedorDto) {
    // executa upsert local **e** envia ao Next
    return this.service.upsertLocalEEnviarParaNext(dto);
  }

  // GET /fornecedor?pedido_cotacao=3957
  @Get()
  @ApiOperation({ summary: 'Lista fornecedores por pedido_cotacao' })
  async list(@Query('pedido_cotacao') pedido: string) {
    const n = Number(pedido);
    if (!Number.isFinite(n)) return { data: [], total: 0 };
    const data = await this.service.listarFornecedoresPorPedido(n);
    return { data, total: data.length };
  }
}
