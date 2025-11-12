// src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth') // La ruta base será /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login') // La ruta completa es POST /auth/login
  @ApiOperation({ summary: 'Iniciar sesión y obtener un JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso. Devuelve el token JWT y datos del usuario.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}