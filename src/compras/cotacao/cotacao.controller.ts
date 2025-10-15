import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { CotacaoService } from './cotacao.service';

// ---------- DTOs ----------
class ItemDto {
  @IsNotEmpty() @IsString()
  cod!: string;

  @IsNotEmpty() @IsString()
  descricao!: string;

  @IsOptional() @IsString()
  marca?: string;

  @IsOptional() @IsString()
  refFornecedor?: string;

  @IsOptional() @IsString()
  unidade?: string;

  @IsInt() @Min(1)
  quantidade!: number;

  @IsOptional()
  valor_unitario?: number;
}

class CreateCotacaoDto {
  @IsNotEmpty() @IsString()
  key!: string; // orcamento_compra

  @IsArray()
  dados!: ItemDto[];
}

class UpdateCotacaoDto extends CreateCotacaoDto {}

// ---------- Controller ----------
@Controller('cotacoes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CotacaoController {
  constructor(private readonly service: CotacaoService) {}

  // GET /cotacoes
  @Get()
  async index() {
    return this.service.list();
  }

  // POST /cotacoes
  @Post()
  async store(@Body() dto: CreateCotacaoDto) {
    return this.service.create(dto);
  }

  // GET /cotacoes/:id
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id);
  }

  // PUT /cotacoes/:id
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCotacaoDto) {
    return this.service.update(id, dto);
  }

  // DELETE /cotacoes/:id
  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
