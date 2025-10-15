import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { UsuarioService, CreateUsuarioInput } from './usuario.service';

class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nome!: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha!: string;
}

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /**
   * GET /usuarios
   * Retorna lista com (usuario_id, nome, email)
   */
  @Get()
  async index() {
    return this.usuarioService.findAll();
  }

  /**
   * POST /usuarios
   * Cria um usuário com trash=0 e senha com hash
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async store(@Body() dto: CreateUsuarioDto) {
    const payload: CreateUsuarioInput = {
      nome: dto.nome,
      email: dto.email,
      senha: dto.senha,
    };
    return this.usuarioService.create(payload);
  }

  /**
   * DELETE /usuarios/:id
   * Remove pelo PK (usuario_id)
   */
  @Delete(':id')
  async destroy(@Param('id') id: string) {
    return this.usuarioService.remove(Number(id));
  }
}
