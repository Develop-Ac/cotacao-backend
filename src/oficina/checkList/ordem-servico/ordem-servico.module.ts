// src/ordem-servico/ordem-servico.module.ts
import { Module } from '@nestjs/common';
import { OrdemServicoController } from './ordem-servico.controller';
import { OrdemServicoService } from './ordem-servico.service';
import { OrdemServicoRepository } from './ordem-servico.repository';

@Module({
  controllers: [OrdemServicoController],
  providers: [OrdemServicoService, OrdemServicoRepository],
  exports: [OrdemServicoService, OrdemServicoRepository],
})
export class OrdemServicoModule {}
