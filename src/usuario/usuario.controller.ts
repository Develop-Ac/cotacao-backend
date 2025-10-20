// src/usuario/usuario.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UsuarioService, CreateUsuarioInput } from './usuario.service';
import { CreateUsuarioDto, UsuarioView } from './usuario.dto';

@ApiTags('Usuários')
@ApiExtraModels(CreateUsuarioDto, UsuarioView)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuários' })
  @ApiOkResponse({
    description: 'Lista de usuários',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(UsuarioView) },
      example: [
        { usuario_id: 1, nome: 'Giovana Custodio', email: 'giovana.custodio@empresa.com' },
        { usuario_id: 2, nome: 'Carlos Siqueira', email: 'carlos.siqueira@empresa.com' },
      ],
    },
  })
  async index() {
    return this.usuarioService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria usuário' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @ApiBody({
    description: 'Payload para criação de usuário',
    schema: {
      allOf: [{ $ref: getSchemaPath(CreateUsuarioDto) }],
      examples: {
        Minimal: {
          summary: 'Exemplo mínimo',
          value: {
            nome: 'Giovana Custodio',
            email: 'giovana.custodio@empresa.com',
            senha: 'SenhaF0rte!',
          },
        },
        Completo: {
          summary: 'Outro exemplo válido',
          value: {
            nome: 'Carlos Siqueira',
            email: 'carlos.siqueira@empresa.com',
            senha: 'S3nh@Segura',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    schema: {
      $ref: getSchemaPath(UsuarioView),
      example: {
        usuario_id: 123,
        nome: 'Giovana Custodio',
        email: 'giovana.custodio@empresa.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Payload inválido',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'senha must be longer than or equal to 6 characters'],
        error: 'Bad Request',
      },
    },
  })
  async store(@Body() dto: CreateUsuarioDto) {
    const payload: CreateUsuarioInput = { nome: dto.nome, email: dto.email, senha: dto.senha };
    return this.usuarioService.create(payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove usuário por ID' })
  @ApiParam({ name: 'id', example: '123', description: 'PK usuario_id' })
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Removido com sucesso (no content)' })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    schema: { example: { statusCode: 404, message: 'Usuário não encontrado' } },
  })
  async destroy(@Param('id') id: string) {
    await this.usuarioService.remove(Number(id));
  }
}
