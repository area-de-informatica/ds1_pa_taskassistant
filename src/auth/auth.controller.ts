// src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; // (Debes crear este archivo)

@Controller('auth') // La ruta base será /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login') // La ruta completa es POST /auth/login
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}