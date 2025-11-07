import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';
import * as bcrypt from 'bcryptjs';

export interface CreateUsuarioInput {
  nome: string;
  codigo: string;
  setor: string;
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
        codigo: data.codigo,
        setor: data.setor,
        senha: senhaHash,
        trash: 0,
      });

      return {
        message: 'Usuário criado com sucesso!',
        data: usuario,
      };
    } catch (e: any) {
      // P2002 = unique constraint (codigo)
      if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('codigo')) {
        throw new ConflictException('Código já está em uso.');
      }
      throw e;
    }
  }

  async findById(id: string) {
    const usuario = await this.repo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async update(id: string, data: Partial<CreateUsuarioInput>) {
    const updateData: any = { ...data };
    
    if (data.senha) {
      updateData.senha = await bcrypt.hash(data.senha, 10);
    }

    try {
      return await this.repo.update(id, updateData);
    } catch (e: any) {
      if (e?.code === 'P2025') {
        throw new NotFoundException('Usuário não encontrado');
      }
      if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('codigo')) {
        throw new ConflictException('Código já existe');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.repo.softDelete(id);
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
