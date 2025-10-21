import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListChecklistsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  perPage?: number = 10;

  @ApiPropertyOptional({ description: 'Busca por OS, placa, cliente', example: 'ABC1D23' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Data Inicial (ISO)', example: '2025-10-01T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Data Final (ISO)', example: '2025-10-31T23:59:59.999Z' })
  @IsString()
  @IsOptional()
  dateTo?: string;
}
