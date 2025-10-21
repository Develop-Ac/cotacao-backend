import { IsOptional, IsString } from 'class-validator';

export class ClienteDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() doc?: string;
  @IsOptional() @IsString() tel?: string;
  @IsOptional() @IsString() end?: string;
}
