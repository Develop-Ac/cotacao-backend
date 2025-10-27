// src/ordem-servico/ordem-servico.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OrdemServicoService } from './ordem-servico.service';
import { OsResponseDto } from './dto/os-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('checklists')
@Controller('ordens-servico')
export class OrdemServicoController {
  constructor(private readonly service: OrdemServicoService) {}

  // GET /ordens-servico/:os
  @Get(':os')
  async getOs(@Param('os', ParseIntPipe) os: number): Promise<OsResponseDto> {
    return this.service.getByNumero(os);
  }
}
