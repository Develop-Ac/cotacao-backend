import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiOkResponse, 
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiParam
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
}
