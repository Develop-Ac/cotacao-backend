import { Controller, Get } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { EntregasService } from './entregas.service';
import { EntregaView } from './entregas.dto';

@ApiTags('Entregas')
@ApiExtraModels(EntregaView)
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as entregas' })
  @ApiOkResponse({
    description: 'Lista de entregas com informações completas',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(EntregaView) },
      example: [
        {
          id: 1,
          cliente: 'Cliente Exemplo Ltda',
          status: 'Em andamento',
          id_entregador: 123,
          venda: 'VENDA-001',
          criado_em: '2024-11-07T10:00:00Z',
          aceito_em: '2024-11-07T10:15:00Z',
          disponivel_para_entrega_em: '2024-11-07T11:00:00Z',
          saiu_para_entrega_em: '2024-11-07T12:00:00Z',
          finalizado_em: null,
          retorno_entregador_em: null,
          embalado_em: '2024-11-07T09:30:00Z',
        },
      ],
    },
  })
  async index() {
    return this.entregasService.findAll();
  }
}