import { Module } from '@nestjs/common';
import { CotacaoController } from './cotacao.controller';
import { CotacaoService } from './cotacao.service';
import { PrismaModule } from '../../prisma/prisma.module'; // remova se PrismaModule for @Global

@Module({
  imports: [PrismaModule], // se PrismaModule é @Global, pode remover
  controllers: [CotacaoController],
  providers: [CotacaoService],
})
export class CotacaoModule {}
