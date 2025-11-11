import { Controller, Get } from '@nestjs/common';
import { NotaFiscalService } from './notaFiscal.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Compras - Nota Fiscal')
@Controller('nota-fiscal')
export class NotaFiscalController {
  constructor(private readonly notaFiscalService: NotaFiscalService) {}

  @Get('nfe-distribuicao')
  async getNfeDistribuicao() {
    return this.notaFiscalService.getNfeDistribuicao();
  }
}