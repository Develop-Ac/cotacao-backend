import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginRepository } from './login.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginService {
  constructor(private readonly repo: LoginRepository) {}

  /**
   * Valida credenciais e retorna o usuário (sem a senha) em caso de sucesso.
   */
  async login(codigo: string, senha: string) {
    const usuario = await this.repo.findUsuarioByCodigo(codigo);

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario não existe.'
      }
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    console.log(senha);
    console.log(usuario.senha);
    if (!senhaValida) {
      return {
        success: false,
        message: 'Senha incorreta.'
      }
    }

    return {
      success: true,
      message: 'Login realizado com sucesso',
      usuario: usuario.nome,
      usuario_id: usuario.id,
      codigo: usuario.codigo,
      setor: usuario.setor,
    };
  }
}
