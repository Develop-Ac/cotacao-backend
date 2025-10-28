// src/compras/cotacao.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CotacaoService } from './cotacao.service';
import { CreateCotacaoDto } from './cotacao.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cotação de Pedidos')
@Controller('pedidos-cotacao')
export class CotacaoController {
  constructor(private service: CotacaoService) {}

  // POST /compras/pedidos-cotacao
  @Post()
  @ApiOperation({ summary: 'Cria ou atualiza cotacao' })
  async create(@Body() dto: CreateCotacaoDto) {
    return this.service.upsertCotacao(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista cotacoes (paginacao/opcoes)' })
  async getAll(
    @Query('empresa') empresaQ?: string,
    @Query('page') pageQ?: string,
    @Query('pageSize') pageSizeQ?: string,
    @Query('includeItems') includeItemsQ?: string,
  ) {
    const toNum = (v?: string) => (v != null && v !== '' ? Number(v) : NaN);

    const page = Number.isFinite(toNum(pageQ)) && toNum(pageQ)! > 0 ? toNum(pageQ)! : 1;
    const pageSize = Number.isFinite(toNum(pageSizeQ)) && toNum(pageSizeQ)! > 0 ? toNum(pageSizeQ)! : 20;
    const empresa = Number.isFinite(toNum(empresaQ)) ? toNum(empresaQ)! : undefined;
    const includeItems = (includeItemsQ ?? '').toLowerCase() === 'true';

    return this.service.listAll({ empresa, page, pageSize, includeItems });
  }

  // GET /compras/pedidos-cotacao/:pedido?empresa=3
  @Get(':pedido')
  @ApiOperation({ summary: 'Obtem cotacao por pedido e empresa' })
  async getOne(
    @Param('pedido', ParseIntPipe) pedido: number,
    @Query('empresa', ParseIntPipe) empresa: number,
  ) {
    return this.service.getCotacao(empresa, pedido);
  }
}
