import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sis_usuarios.findMany({
      select: { id: true, nome: true, email: true },
      orderBy: { id: 'asc' },
    });
  }

  create(data: Prisma.sis_usuariosCreateInput) {
    return this.prisma.sis_usuarios.create({
      data,
      select: { id: true, nome: true, email: true },
    });
  }

  delete(id: string) {
    return this.prisma.sis_usuarios.delete({
      where: { id },
    });
  }
}
