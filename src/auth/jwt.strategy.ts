// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token "Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ESTE-ES-UN-SECRETO-DE-DESARROLLO',
    });
  }

  /**
   * NestJS llama a esto automáticamente después de verificar el token.
   * Lo que devolvemos aquí se adjunta a request.user en los controladores protegidos.
   */
  async validate(payload: any) {
    // El payload es lo que pusimos en auth.service (id, email, rol)
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}