// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // Lo refactorizaremos
import { Usuario, UsuarioSchema } from '../schemas/usuario.schema';

@Module({
  imports: [
    // Importar el esquema de Mongoose
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
    ]),

    PassportModule,
    
    // Configurar el Módulo JWT
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importar ConfigModule para usar .env
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Lee el secreto y el tiempo de expiración desde tu .env
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: Number(configService.get<string>('JWT_EXPIRES_IN')) || 1800,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, // El proveedor de la estrategia
  ],
  exports: [
    JwtStrategy, 
    PassportModule
  ], // Exportar para que otros módulos puedan usar los Guards
})
export class AuthModule {}