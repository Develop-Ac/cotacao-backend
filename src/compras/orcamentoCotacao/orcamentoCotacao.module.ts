import { Module } from '@nestjs/common';
import { OrcamentoCotacaoController } from './orcamentoCotacao.controller';
import { OrcamentoCotacaoService } from './orcamentoCotacao.service';
import { PrismaModule } from '../../prisma/prisma.module'; // remova se PrismaModule for @Global()

@Module({
  imports: [PrismaModule], // remova se seu PrismaModule já for @Global()
  controllers: [OrcamentoCotacaoController],
  providers: [OrcamentoCotacaoService],
})
export class OrcamentoCotacaoModule {}
