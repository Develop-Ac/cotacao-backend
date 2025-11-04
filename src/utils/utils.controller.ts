import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UtilsService } from './utils.service';

@ApiTags('Utilitários')
@Controller('utils/mssql')
export class UtilsController {
  constructor(private readonly svc: UtilsService) {}

  /** GET /utils/mssql/tabelas  -> retorna só os nomes das tabelas e imprime no console */
  @Get('tabelas')
  @ApiOperation({ 
    summary: 'Lista nomes de tabelas no MSSQL',
    description: 'Retorna uma lista com os nomes de todas as tabelas disponíveis no banco MSSQL'
  })
  @ApiOkResponse({
    description: 'Lista de nomes das tabelas',
    example: ['tabela1', 'tabela2', 'tabela3'],
    schema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  async getTodasTabelas() {
    const names = await this.svc.listAllTableNames();
    return names; // array de strings
  }
}
