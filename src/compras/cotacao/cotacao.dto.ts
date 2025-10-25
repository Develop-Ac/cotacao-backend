// src/compras/dto/create-cotacao.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CotacaoItemDto {
  @IsInt() PEDIDO_COTACAO: number;

  @IsOptional()
  @IsISO8601()
  EMISSAO?: string | null;

  @IsNumber() PRO_CODIGO: number;
  @IsString() PRO_DESCRICAO: string;

  @IsOptional() @IsString() MAR_DESCRICAO?: string | null;
  @IsOptional() @IsString() REFERENCIA?: string | null;
  @IsOptional() @IsString() UNIDADE?: string | null;

  @IsNumber() QUANTIDADE: number;
}

export class CreateCotacaoDto {
  @IsInt() empresa: number;
  @IsInt() pedido_cotacao: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CotacaoItemDto)
  itens: CotacaoItemDto[];
}
