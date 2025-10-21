import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AvariaDto {
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsString() peca?: string;
  @IsOptional() @IsString() observacoes?: string;

  @IsOptional() @IsNumber() posX?: number;
  @IsOptional() @IsNumber() posY?: number;
  @IsOptional() @IsNumber() posZ?: number;

  @IsOptional() @IsNumber() normX?: number;
  @IsOptional() @IsNumber() normY?: number;
  @IsOptional() @IsNumber() normZ?: number;

  @IsOptional() @IsString() fotoBase64?: string;

  // vindo do front como epoch ms; converteremos no service
  @IsOptional() @IsNumber() timestamp?: number;
}
