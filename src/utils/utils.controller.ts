import { Controller, Get } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Controller('utils/mssql')
export class UtilsController {
  constructor(private readonly svc: UtilsService) {}

  /** GET /utils/mssql/tabelas  -> retorna só os nomes das tabelas e imprime no console */
  @Get('tabelas')
  async getTodasTabelas() {
    const names = await this.svc.listAllTableNames();
    return names; // array de strings
  }
}
