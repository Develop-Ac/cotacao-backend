import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaF0rte!' })
  @IsNotEmpty()
  @IsString()
  senha!: string;
}

export class LoginResponseView {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 3600, description: 'Validade do token em segundos' })
  expires_in!: number;

  @ApiProperty({
    example: { usuario_id: 123, nome: 'Giovana Custodio', email: 'usuario@empresa.com' },
  })
  user!: { usuario_id: number; nome: string; email: string };
}

