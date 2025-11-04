import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Giovana Custodio', maxLength: 255 })
  @IsNotEmpty() @IsString() @MaxLength(255)
  nome!: string;

  @ApiProperty({ example: '12345', maxLength: 50, description: 'Código único do usuário' })
  @IsNotEmpty() @IsString() @MaxLength(50)
  codigo!: string;

  @ApiProperty({ example: 'TI', maxLength: 100, description: 'Setor do usuário' })
  @IsNotEmpty() @IsString() @MaxLength(100)
  setor!: string;

  @ApiProperty({ example: 'SenhaF0rte!', minLength: 6, description: 'Mínimo 6 caracteres' })
  @IsNotEmpty() @IsString() @MinLength(6)
  senha!: string;
}

export class UsuarioView {
  @ApiProperty({ example: 'cuid123' }) id!: string;
  @ApiProperty({ example: 'Giovana Custodio' }) nome!: string;
  @ApiProperty({ example: '12345' }) codigo!: string;
  @ApiProperty({ example: 'TI' }) setor!: string;
}

