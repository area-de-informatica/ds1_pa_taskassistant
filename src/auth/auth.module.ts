// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module'; // Importa tu módulo de Prisma
import { JwtStrategy } from './jwt.strategy'; // Lo crearemos ahora

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ESTE-ES-UN-SECRETO-DE-DESARROLLO', // ¡Usa variables de entorno en producción!
      signOptions: { 
        expiresIn: '30m' // El token expira en 30 minutos (como pide tu RNF-SEC-03 [cite: 503])
      }, 
    }),
  ],
  providers: [AuthService, JwtStrategy], // Incluimos la estrategia
  controllers: [AuthController],
})
export class AuthModule {}