import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChecklistsService } from './checkList.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { ListChecklistsQueryDto } from './dto/list-checklists.dto';

@ApiTags('checklists')
@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly service: ChecklistsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar checklist 3D (recebe JSON do front)' })
  @ApiResponse({ status: 201, description: 'Checklist criado' })
  async create(@Body() body: CreateChecklistDto) {
    const saved = await this.service.create(body);
    return { id: saved.id, createdAt: saved.createdAt };
  }

  @Get()
  @ApiOperation({ summary: 'Listar checklists (pagina/busca)' })
  async list(@Query() q: ListChecklistsQueryDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter checklist por id' })
  async getOne(@Param('id', ParseIntPipe) id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover checklist' })
  async remove(@Param('id', ParseIntPipe) id: string) {
    return this.service.remove(id);
  }
}
