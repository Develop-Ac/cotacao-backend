import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class VeiculoDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() placa?: string;
  @IsOptional() @IsString() cor?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647) // INT 32 bits
  km?: number | null;
}
