// src/ordem-servico/ordem-servico.module.ts
import { Module } from '@nestjs/common';
import { OrdemServicoController } from './ordem-servico.controller';
import { OrdemServicoService } from './ordem-servico.service';

@Module({
  controllers: [OrdemServicoController],
  providers: [OrdemServicoService],
  exports: [OrdemServicoService],
})
export class OrdemServicoModule {}
