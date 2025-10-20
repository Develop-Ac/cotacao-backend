import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

// ================= DTOs (request) =================
export class StoreItemDto {
  @ApiProperty({ example: 'Lâmpada LED H7 Ultra' })
  @IsNotEmpty() @IsString()
  descricao!: string;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt() @Min(1)
  quantidade!: number;

  // Aceita "129,90" (string) ou 129.9 (number)
  @ApiProperty({ examples: ['129,90', 129.9] as any, description: 'Pode ser string com vírgula ou número' })
  @IsNotEmpty()
  valor_unitario!: any;
}

export class StoreOrcamentoCotacaoDto {
  @ApiProperty({ example: 101, description: 'cotacao_id' })
  @IsInt() @Min(1)
  id!: number;

  @ApiProperty({ example: 'Fornecedor X' })
  @IsNotEmpty() @IsString()
  fornecedor!: string;

  @ApiProperty({ example: 'Prazo de entrega 7 dias', required: false })
  @IsOptional() @IsString()
  observacao?: string;

  @ApiProperty({ type: [StoreItemDto] })
  @IsArray()
  dados!: StoreItemDto[];
}

export class UpdateSelecionadoDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  selecionado!: boolean;
}

// ================= Views (responses) =================
export class OrcamentoItemView {
  @ApiProperty({ example: 'Lâmpada LED H7 Ultra' }) descricao!: string;
  @ApiProperty({ example: 4 }) quantidade!: number;
  @ApiProperty({ example: 129.9 }) valor_unitario!: number;
  @ApiProperty({ example: 519.6 }) total_item!: number;
}

export class OrcamentoView {
  @ApiProperty({ example: 555 }) id!: number; // orçamento_id
  @ApiProperty({ example: 'Fornecedor X' }) fornecedor!: string;
  @ApiProperty({ example: 'Prazo de entrega 7 dias', required: false }) observacao?: string;
  @ApiProperty({ example: false }) selecionado!: boolean;
  @ApiProperty({ type: [OrcamentoItemView] }) dados!: OrcamentoItemView[];
  @ApiProperty({ example: 519.6 }) total!: number;
  @ApiProperty({ example: '2025-10-15T12:10:00.000Z' }) criadoEm!: string;
  @ApiProperty({ example: '2025-10-15T12:10:00.000Z' }) atualizadoEm!: string;
}

export class CotacaoComOrcamentosView {
  @ApiProperty({ example: 101 }) id!: number; // cotacao_id
  @ApiProperty({ example: 'ORC-2025-001234' }) key!: string;
  @ApiProperty({ type: [OrcamentoView] }) orcamentos!: OrcamentoView[];
  @ApiProperty({ example: '2025-10-15T12:00:00.000Z' }) criadoEm!: string;
  @ApiProperty({ example: '2025-10-15T12:45:00.000Z' }) atualizadoEm!: string;
}

