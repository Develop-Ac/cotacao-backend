// src/login/login.controller.ts
import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiExtraModels,
  getSchemaPath,
  ApiConsumes,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LoginService } from './login.service';

class LoginDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaF0rte!' })
  @IsNotEmpty()
  @IsString()
  senha!: string;
}

class LoginResponseView {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 3600, description: 'Validade do token em segundos' })
  expires_in!: number;

  @ApiProperty({
    example: { usuario_id: 123, nome: 'Giovana Custodio', email: 'usuario@empresa.com' },
  })
  user!: { usuario_id: number; nome: string; email: string };
}

@ApiTags('Auth')
@ApiExtraModels(LoginDto, LoginResponseView)
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @ApiOperation({ summary: 'Autentica o usuário e retorna o token' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Credenciais de acesso',
    // Em versões antigas, use schema + examples no nível do decorator
    schema: { allOf: [{ $ref: getSchemaPath(LoginDto) }] },
    examples: {
      Valido: {
        summary: 'Exemplo válido',
        value: { email: 'usuario@empresa.com', senha: 'SenhaF0rte!' },
      },
      EmailInvalido: {
        summary: 'Email inválido',
        value: { email: 'usuario@empresa', senha: 'qualquer' },
      },
      CamposVazios: {
        summary: 'Campos vazios',
        value: { email: '', senha: '' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login bem-sucedido',
    schema: {
      $ref: getSchemaPath(LoginResponseView),
      // Em versões antigas, exemplo vai dentro de schema.example
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expires_in: 3600,
        user: {
          usuario_id: 123,
          nome: 'Giovana Custodio',
          email: 'usuario@empresa.com',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Payload inválido (validação)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'email should not be empty',
          'senha should not be empty',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais incorretas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Email ou senha inválidos',
        error: 'Unauthorized',
      },
    },
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto.email, dto.senha);
  }
}
