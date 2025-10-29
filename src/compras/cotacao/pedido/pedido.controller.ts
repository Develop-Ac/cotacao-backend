// src/pedido/pedido.controller.ts
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import express from 'express';
import type { Response as ExpressResponse } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cotação de Pedidos')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly service: PedidoService) {}

    // GET /pedido  -> listagem leve
  @Get()
  @ApiOperation({ summary: 'Lista pedidos (leve)' })
  async listagem() {
    return this.service.listagem();
  } 

  // GET /pedido/:pedido  -> PDF
  @Get(':id')
  @ApiOperation({ summary: 'Gera PDF do pedido' })
  async pdf(
    @Param('id') id: string,
    @Query('marca') marca: string | undefined,
    @Res() res: ExpressResponse, // << mesmo tipo que o service espera
  ) {
    const showMarca =
      marca == null ? true : /^(true|1|on|yes)$/i.test(String(marca).trim());

    // O service já dá pipe(res) e finaliza com doc.end()
    await this.service.gerarPdfPedidoExpress(res, id, { marca: showMarca });
  }


  @Post()
  @ApiOperation({ summary: 'Cria ou atualiza pedido' })
  async create(@Body() body: CreatePedidoDto) {
    return this.service.createOrReplace(body);
  }
}
