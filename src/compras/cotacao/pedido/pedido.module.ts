// src/pedido/pedido.module.ts
import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PedidoRepository } from './pedido.repository';

@Module({
  controllers: [PedidoController],
  providers: [PedidoService, PrismaService, PedidoRepository],
})
export class PedidoModule {}
