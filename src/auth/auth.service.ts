// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Usuario, UsuarioDocument } from '../schemas/usuario.schema';
import { LoginDto } from './dto/login.dto';

// Define el tipo de Rol (basado en tu app)
type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida al usuario. Es llamado por la estrategia local (si la usaras)
   * o directamente por nuestro servicio de login.
   * @param email El email del usuario
   * @param pass La contraseña en texto plano
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuarioModel.findOne({ email }).exec();

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Si la validación es exitosa, devuelve el usuario sin la contraseña
      const { password, ...result } = user.toObject(); // .toObject() es de Mongoose
      return result;
    }
    // Si falla, devuelve null
    return null;
  }

  /**
   * Maneja el endpoint de Login
   * @param loginDto Contiene email y password
   */
  async login(loginDto: LoginDto) {
    // 1. Validar el usuario usando el método anterior
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Crear el Payload del JWT
    // ¡Aquí es donde incluimos el ROL, que es vital para RBAC!
    const payload = { 
      sub: user._id, // El ID de Mongo (importante: _id)
      email: user.email,
      rol: user.rol as RolUsuario, // Asegúrate de que el 'rol' esté guardado en tu doc de Usuario
      nombre: user.nombre,
    };

    // 3. Firmar y devolver el token
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      }
    };
  }

  // (Aquí iría la lógica de registro/signup si la tuvieras)
}