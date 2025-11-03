import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { LoginRepository } from './login.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LoginController],
  providers: [LoginService, LoginRepository],
  exports: [LoginService, LoginRepository],
})
export class LoginModule {}
