import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { OrcamentoCotacaoService } from './orcamentoCotacao.service';

class StoreItemDto {
  @IsNotEmpty() @IsString()
  descricao!: string;

  @IsInt() @Min(1)
  quantidade!: number;

  // pode vir "12,34" (string) ou 12.34 (number).
  // Se quiser validar ambos, poderia usar um custom validator; aqui deixamos flexível.
  @IsNotEmpty()
  valor_unitario!: any;
}

class StoreOrcamentoCotacaoDto {
  @IsInt() @Min(1)
  id!: number; // cotacao_id

  @IsNotEmpty() @IsString()
  fornecedor!: string;

  @IsOptional() @IsString()
  observacao?: string;

  @IsArray()
  dados!: StoreItemDto[];
}

class UpdateSelecionadoDto {
  @IsBoolean()
  selecionado!: boolean;
}

@Controller('orcamentos-cotacao')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrcamentoCotacaoController {
  constructor(private readonly service: OrcamentoCotacaoService) {}

  /**
   * POST /orcamentos-cotacao
   * Body: { id (cotacao_id), fornecedor, observacao?, dados: [{descricao, quantidade, valor_unitario}] }
   */
  @Post()
  async store(@Body() dto: StoreOrcamentoCotacaoDto) {
    return this.service.store(dto);
  }

  /**
   * GET /orcamentos-cotacao/:id
   * Retorna a cotação (id) com seus orçamentos
   */
  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.service.getCotacaoComOrcamentos(id);
  }

  /**
   * PATCH /orcamentos-cotacao/:id
   * Atualiza "selecionado" do orçamento com id = :id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSelecionadoDto,
  ) {
    return this.service.updateSelecionado(id, dto.selecionado);
  }
}
