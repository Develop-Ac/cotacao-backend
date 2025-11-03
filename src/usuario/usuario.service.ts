import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';
import * as bcrypt from 'bcryptjs';

export interface CreateUsuarioInput {
  nome: string;
  email: string;
  senha: string;
}

@Injectable()
export class UsuarioService {
  constructor(private readonly repo: UsuarioRepository) {}

  async findAll() {
    return this.repo.findAll();
  }

  async create(data: CreateUsuarioInput) {
    // hash da senha
    const senhaHash = await bcrypt.hash(data.senha, 10);

    try {
      const usuario = await this.repo.create({
        nome: data.nome,
        email: data.email,
        senha: senhaHash,
        trash: 0,
      });

      return {
        message: 'Usuário criado com sucesso!',
        data: usuario,
      };
    } catch (e: any) {
      // P2002 = unique constraint (email)
      if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('email')) {
        throw new ConflictException('E-mail já está em uso.');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.repo.delete(id);
      return { message: 'Usuário removido com sucesso!' };
    } catch (e: any) {
      // P2025 = record not found
      if (e?.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado.');
      }
      throw e;
    }
  }
}
