// src/pedido/pedido.controller.ts
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import express from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Cotação de Pedidos')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly service: PedidoService) {}

    // GET /pedido  -> listagem leve
  @Get()
  async listagem() {
    return this.service.listagem();
  } 

  // GET /pedido/:pedido  -> PDF
  @Get(':id')
  async pdfById(@Param('id') id: string, @Res() res: express.Response) {
    await this.service.gerarPdfPedidoExpress(res, id);
  }

  @Post()
  async create(@Body() body: CreatePedidoDto) {
    return this.service.createOrReplace(body);
  }
}
