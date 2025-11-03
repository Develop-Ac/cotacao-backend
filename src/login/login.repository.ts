import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsuarioByEmail(email: string) {
    return this.prisma.sis_usuarios.findUnique({
      where: { email },
    });
  }
}
