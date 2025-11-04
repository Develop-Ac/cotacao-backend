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
  ApiExtraModels,
  getSchemaPath,
  ApiConsumes,
} from '@nestjs/swagger';
// (DTOs foram movidos para ./login.dto)
import { LoginService } from './login.service';
import { LoginDto, LoginResponseView } from './login.dto';

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
        value: { codigo: 'USR001', senha: 'SenhaF0rte!' },
      },
      CodigoInvalido: {
        summary: 'Código inválido',
        value: { codigo: '', senha: 'qualquer' },
      },
      CamposVazios: {
        summary: 'Campos vazios',
        value: { codigo: '', senha: '' },
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
          codigo: 'USR001',
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
          'codigo should not be empty',
          'codigo must be a string',
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
        message: 'Código ou senha inválidos',
        error: 'Unauthorized',
      },
    },
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto.codigo, dto.senha);
  }
}
