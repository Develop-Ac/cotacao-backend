// src/oficina/checkList/dto/create-checklist.dto.ts
import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/** Helper: transforma string/number em number ou null */
function toNumberOrNull({ value }: { value: any }) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Item do checklist (linha da tabela “Checklist de Itens”) */
export class ChecklistItemDto {
  @ApiProperty({ example: 'Extintor de Incêndio' })
  @IsString()
  @MaxLength(200)
  item!: string;

  @ApiProperty({ example: 'OK', description: 'OK | Avariado | Faltante | N/A' })
  @IsString()
  @MaxLength(50)
  status!: string;
}

/** Avaria registrada no 3D */
export class AvariaDto {
  @ApiPropertyOptional({ example: 'Riscado' })
  @IsOptional() @IsString() @MaxLength(100)
  tipo?: string;

  @ApiPropertyOptional({ example: 'Porta Dianteira Direita' })
  @IsOptional() @IsString() @MaxLength(200)
  peca?: string;

  @ApiPropertyOptional({ example: 'Risco leve de ~10cm' })
  @IsOptional() @IsString() @MaxLength(2000)
  observacoes?: string;

  @ApiPropertyOptional({ example: 0.3 })
  @IsOptional() @IsNumber()
  posX?: number;

  @ApiPropertyOptional({ example: 0.65 })
  @IsOptional() @IsNumber()
  posY?: number;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional() @IsNumber()
  posZ?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber()
  normX?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsNumber()
  normY?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber()
  normZ?: number;

  @ApiPropertyOptional({ description: 'data:image/png;base64,...', example: 'data:image/png;base64,iVBORw0K...' })
  @IsOptional() @IsString()
  fotoBase64?: string | null;

  @ApiPropertyOptional({ description: 'Epoch ms ou ISODate', example: 1697800000000 })
  @IsOptional()
  timestamp?: number;
}

@ApiExtraModels(ChecklistItemDto, AvariaDto)
export class CreateChecklistDto {
  // ========= Cabeçalho / básicos =========
  @ApiPropertyOptional({ example: 'OS-2025-001' })
  @IsOptional() @IsString() @MaxLength(120)
  osInterna?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601',
    example: '2025-10-20T10:30:00.000Z',
  })
  @IsOptional() @IsDateString()
  dataHoraEntrada?: string;

  @ApiPropertyOptional({ example: 'Cliente solicitou cuidado com a pintura.' })
  @IsOptional() @IsString() @MaxLength(5000)
  observacoes?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional() @IsInt()
  combustivelPercentual?: number;

  // ========= Cliente =========
  @ApiPropertyOptional({ example: 'Giovana Custódio' })
  @IsOptional() @IsString() @MaxLength(200)
  clienteNome?: string;

  @ApiPropertyOptional({ example: '000.000.000-00' })
  @IsOptional() @IsString() @MaxLength(50)
  clienteDoc?: string;

  @ApiPropertyOptional({ example: '(65) 9 9999-0000' })
  @IsOptional() @IsString() @MaxLength(50)
  clienteTel?: string;

  @ApiPropertyOptional({ example: 'Rua A, 123 - Centro' })
  @IsOptional() @IsString() @MaxLength(400)
  clienteEnd?: string;

  // ========= Veículo =========
  @ApiPropertyOptional({ example: 'Hilux SRV 4x4' })
  @IsOptional() @IsString() @MaxLength(200)
  veiculoNome?: string;

  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional() @IsString() @MaxLength(20)
  veiculoPlaca?: string;

  @ApiPropertyOptional({ example: 'Preto' })
  @IsOptional() @IsString() @MaxLength(50)
  veiculoCor?: string;

  @ApiPropertyOptional({
    description: 'Aceita string ou number; será convertido para number no backend',
    examples: { comoNumero: { value: 12345 }, comoTexto: { value: '12345' } },
  })
  @IsOptional()
  @Transform(toNumberOrNull)
  veiculoKm?: number | null;

  // ========= Checklist =========
  @ApiPropertyOptional({
    type: [ChecklistItemDto],
    example: [
      { item: 'Extintor de Incêndio', status: 'OK' },
      { item: 'Documento do Veículo', status: 'N/A' },
    ],
  })
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];

  // ========= Avarias =========
  @ApiPropertyOptional({
    type: [AvariaDto],
    example: [
      {
        tipo: 'Riscado',
        peca: 'Porta Dianteira Direita',
        observacoes: 'Risco leve de 10cm',
        posX: 0.3, posY: 0.65, posZ: 1.0,
        normX: 0, normY: 1, normZ: 0,
        fotoBase64: 'data:image/png;base64,iVBORw0K...',
        timestamp: 1697800000000,
      },
    ],
  })
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvariaDto)
  avarias?: AvariaDto[];

  // ========= Assinaturas (base64) =========
  @ApiPropertyOptional({
    description: 'Assinatura do cliente em data URL ou base64 puro',
    example: 'data:image/png;base64,iVBORw0K...',
  })
  @IsOptional() @IsString()
  assinaturasclienteBase64?: string | null;

  @ApiPropertyOptional({
    description: 'Assinatura do responsável em data URL ou base64 puro',
    example: null,
  })
  @IsOptional() @IsString()
  assinaturasresponsavelBase64?: string | null;

  // ========= Aliases legados (compat) =========
  @ApiPropertyOptional({ deprecated: true, example: 'data:image/png;base64,iVBORw0K...' })
  @IsOptional() @IsString()
  assinaturaClienteBase64?: string | null;

  @ApiPropertyOptional({ deprecated: true, example: null })
  @IsOptional() @IsString()
  assinaturaResponsavelBase64?: string | null;
}
