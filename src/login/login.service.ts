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
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) {
      throw new UnauthorizedException('Senha incorreta');
    }

    // remove a senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      success: true,
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
    };
  }
}
