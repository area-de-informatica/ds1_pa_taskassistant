// src/auth/guards/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // No se necesita nada más aquí.
  // Al extender AuthGuard('jwt'), NestJS sabe automáticamente
  // que debe usar nuestra 'JwtStrategy' (jwt.strategy.ts)
  // para validar el token de la petición.
}