import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { PrismaModule } from '../prisma/prisma.module'; // se o PrismaModule for @Global(), pode remover este import

@Module({
  imports: [PrismaModule], // remova se o PrismaModule for global
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
