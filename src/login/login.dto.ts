import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'USR001' })
  @IsNotEmpty()
  @IsString()
  codigo!: string;

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
    example: { usuario_id: 123, nome: 'Giovana Custodio', codigo: 'USR001', setor: 'TI' },
  })
  user!: { usuario_id: number; nome: string; codigo: string; setor?: string };
}

