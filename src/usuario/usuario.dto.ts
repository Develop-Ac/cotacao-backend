// import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

// export class CreateUsuarioDto {
//   @ApiProperty({ example: 'Giovana Custodio', maxLength: 255 })
//   @IsNotEmpty() @IsString() @MaxLength(255)
//   nome!: string;

//   @ApiProperty({ example: 'giovana.custodio@empresa.com', maxLength: 255 })
//   @IsNotEmpty() @IsEmail() @MaxLength(255)
//   email!: string;

//   @ApiProperty({ example: 'SenhaF0rte!', minLength: 6, description: 'Mínimo 6 caracteres' })
//   @IsNotEmpty() @IsString() @MinLength(6)
//   senha!: string;
// }

// export class UsuarioView {
//   @ApiProperty({ example: 123 }) usuario_id!: number;
//   @ApiProperty({ example: 'Giovana Custodio' }) nome!: string;
//   @ApiProperty({ example: 'giovana.custodio@empresa.com' }) email!: string;
// }

