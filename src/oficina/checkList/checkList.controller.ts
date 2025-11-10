import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiOkResponse, 
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { ChecklistsService } from './checkList.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ListChecklistsQueryDto } from './dto/list-checklists.dto';

@ApiTags('Oficina - Checklists')
@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly service: ChecklistsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar checklist 3D',
    description: 'Cria um novo checklist recebendo dados JSON do frontend'
  }) 
  @ApiCreatedResponse({ 
    description: 'Checklist criado com sucesso', 
    example: { id: 'abc123', createdAt: '2024-01-01T10:00:00.000Z' }
  }) 
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  async create(@Body() body: CreateChecklistDto) {
    const saved = await this.service.create(body);
    return { id: saved.id, createdAt: saved.createdAt };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar checklists',
    description: 'Lista checklists com suporte a paginação e busca'
  })
  @ApiOkResponse({
    description: 'Lista de checklists retornada com sucesso'
  })
  async list(@Query() q: ListChecklistsQueryDto) {
    return this.service.findAll(q);
  }

  @Delete(':id') 
  @ApiOperation({ summary: 'Remover checklist' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    return this.service.remove(id);
  }

  @Get(':os')
  async getCheckListByOs(@Param('os') os: string) { 
    const checklist = await this.service.findByOs(os);
    if (!checklist) throw new NotFoundException('Checklist não encontrado');
    // Cria cópia convertendo veiculoKm para string
    const response = { ...checklist, veiculoKm: checklist.veiculoKm?.toString() ?? null };
    return response;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar checklist',
    description: 'Atualiza um checklist existente com base nos dados fornecidos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Checklist atualizado com sucesso' 
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        osInterna: { type: 'string' },
        dataHoraEntrada: { type: 'string', format: 'date-time' },
        observacoes: { type: 'string', nullable: true },
        combustivelPercentual: { type: 'number' },
        clienteNome: { type: 'string' },
        clienteDoc: { type: 'string' },
        clienteTel: { type: 'string' },
        clienteEnd: { type: 'string' },
        veiculoNome: { type: 'string' },
        veiculoPlaca: { type: 'string' },
        veiculoCor: { type: 'string' },
        veiculoKm: { type: 'string' },
        ofi_checklists_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nome: { type: 'string' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async updateChecklist(@Param('id') id: string, @Body() checklist: any) {
    // Remover o campo checklistId, se existir
    const { checklistId, ...validChecklist } = checklist;

    const updatedChecklist = await this.service.update(id, validChecklist);

    // Converter BigInt para string na resposta
    const response = JSON.parse(
      JSON.stringify(updatedChecklist, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return response;
  }
}
