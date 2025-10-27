import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida credenciais e retorna o usuário (sem a senha) em caso de sucesso.
   */
  async login(email: string, senha: string) {
    const usuario = await this.prisma.com_usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario não existe.'
      }
    }

    if (senha != usuario.senha) {
      return {
        success: false,
        message: 'Senha incorreta.'
      }
    }

    return {
      success: true,
      message: 'Login realizado com sucesso',
      usuario: usuario.nome,
      usuario_id: usuario.id
    };
  }
}
