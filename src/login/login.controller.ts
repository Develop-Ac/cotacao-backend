import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LoginService } from './login.service';

class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  senha!: string;
}

@Controller('login') // rota final: POST /login
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto.email, dto.senha);
  }
}
