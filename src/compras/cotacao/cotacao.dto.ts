import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// ---------- DTOs (request) ----------
export class ItemDto {
  @ApiProperty({ example: 'HLX-2016-BP' })
  @IsNotEmpty() @IsString()
  cod!: string;

  @ApiProperty({ example: 'Grade frontal Hilux Black Piano 2016/2020' })
  @IsNotEmpty() @IsString()
  descricao!: string;

  @ApiProperty({ example: 'ACRART', required: false })
  @IsOptional() @IsString()
  marca?: string;

  @ApiProperty({ example: 'AR-7789', required: false })
  @IsOptional() @IsString()
  refFornecedor?: string;

  @ApiProperty({ example: 'PC', required: false })
  @IsOptional() @IsString()
  unidade?: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt() @Min(1)
  quantidade!: number;

  @ApiProperty({ example: 499.9, required: false })
  @IsOptional()
  valor_unitario?: number;
}

export class CreateCotacaoDto {
  @ApiProperty({ example: 'ORC-2025-001234' })
  @IsNotEmpty() @IsString()
  key!: string; // orcamento_compra

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  dados!: ItemDto[];
}

export class UpdateCotacaoDto extends CreateCotacaoDto {}

// ---------- Views (apenas para documentação de respostas) ----------
export class CotacaoItemView {
  @ApiProperty({ example: 'HLX-2016-BP' }) cod!: string;
  @ApiProperty({ example: 'Grade frontal Hilux Black Piano 2016/2020' }) descricao!: string;
  @ApiProperty({ example: 'ACRART', required: false }) marca?: string;
  @ApiProperty({ example: 'AR-7789', required: false }) refFornecedor?: string;
  @ApiProperty({ example: 'PC', required: false }) unidade?: string;
  @ApiProperty({ example: 2 }) quantidade!: number;
  @ApiProperty({ example: 499.9, required: false }) valor_unitario?: number;
}

export class CotacaoView {
  @ApiProperty({ example: 101 }) id!: number;
  @ApiProperty({ example: 'ORC-2025-001234' }) key!: string;
  @ApiProperty({ type: [CotacaoItemView] }) dados!: CotacaoItemView[];
  @ApiProperty({ example: '2025-10-15T12:00:00.000Z' }) criadoEm!: string;
  @ApiProperty({ example: '2025-10-15T12:00:00.000Z' }) atualizadoEm!: string;
}

