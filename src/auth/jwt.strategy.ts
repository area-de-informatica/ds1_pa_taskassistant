// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define el tipo de Rol
type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

// Define la forma del Payload (lo que guardamos en el token)
type JwtPayload = {
  sub: string; // El _id del usuario
  email: string;
  rol: RolUsuario;
  nombre: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      // 1. De dónde sacar el token (del Header "Bearer ...")
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. No ignorar la expiración
      ignoreExpiration: false,
      // 3. El secreto para verificar la firma
  secretOrKey: configService.get<string>('JWT_SECRET') ?? (() => { throw new Error('JWT_SECRET is not defined'); })(),
    });
  }
  

  /**
   * Este método se llama AUTOMÁTICAMENTE después de que
   * passport-jwt verifica que el token es válido.
   * El 'payload' es el objeto que firmamos en auth.service.ts
   */
  async validate(payload: JwtPayload) {
    // Lo que devolvemos aquí se adjuntará a CADA
    // petición en `request.user`
    
    // (Opcional: podrías hacer un findById(payload.sub) aquí
    // para devolver un usuario "fresco" de la BD, pero no es
    // necesario si solo necesitas el ID y el ROL del token)
    
    return { 
      userId: payload.sub, // Renombramos 'sub' a 'userId' por claridad
      email: payload.email,
      rol: payload.rol,
      nombre: payload.nombre,
    };
  }
}