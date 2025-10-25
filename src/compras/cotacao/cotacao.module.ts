// src/compras/cotacao.module.ts
import { Module } from '@nestjs/common';
import { CotacaoController } from './cotacao.controller';
import { CotacaoService } from './cotacao.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CotacaoController],
  providers: [CotacaoService, PrismaService],
})
export class CotacaoModule {}
