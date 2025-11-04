// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto'; // Crearemos este DTO

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida un usuario contra la base de datos
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({ where: { email } });

    if (user) {
      // (¡Necesitarás 'bcrypt' para comparar contraseñas hash!)
      // Asumiremos que tu contraseña en la BD está hasheada
      const isMatch = true; // Reemplaza esto con: await bcrypt.compare(pass, user.passwordHash);
      
      if (isMatch) {
        // No devuelvas la contraseña ni otros datos sensibles
        const { id, rol } = user;
        return { id, email, rol };
      }
    }
    return null;
  }

  /**
   * Maneja el inicio de sesión y devuelve un JWT
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // El 'payload' es la información que guardamos dentro del token.
    // El rol es CRÍTICO para el control de acceso (RBAC)[cite: 500].
    const payload = { 
      sub: user.id, // 'subject' (el ID del usuario)
      email: user.email,
      rol: user.rol // ¡Aquí guardamos el rol!
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}