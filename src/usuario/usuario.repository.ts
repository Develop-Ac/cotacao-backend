import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sis_usuarios.findMany({
      where: { trash: 0 },
      select: { id: true, nome: true, setor: true, codigo: true, trash: true },
      orderBy: { id: 'asc' },
    });
  }

  create(data: Prisma.sis_usuariosCreateInput) {
    return this.prisma.sis_usuarios.create({
      data,
      select: { id: true, nome: true, setor: true },
    });
  }

  findById(id: string) {
    return this.prisma.sis_usuarios.findUnique({
      where: { id, trash: 0 },
      select: { id: true, nome: true, setor: true, codigo: true },
    });
  }

  update(id: string, data: Prisma.sis_usuariosUpdateInput) {
    return this.prisma.sis_usuarios.update({
      where: { id, trash: 0 },
      data,
      select: { id: true, nome: true, setor: true, codigo: true },
    });
  }

  softDelete(id: string) {
    return this.prisma.sis_usuarios.update({
      where: { id, trash: 0 },
      data: { trash: 1 },
      select: { id: true, nome: true, setor: true },
    });
  }

  delete(id: string) {
    return this.prisma.sis_usuarios.delete({
      where: { id },
    });
  }
}
