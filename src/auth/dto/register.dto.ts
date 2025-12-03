// src/auth/dto/register.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

// Roles permitidos
const rolesValidos = ['administrador', 'docente_principal', 'docente_invitado', 'estudiante'];

export class RegisterDto {
  @ApiProperty({ example: 'Daniel Sánchez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'test@correo.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  // --- NUEVO CAMPO PARA PRUEBAS ---
  @ApiProperty({ 
    example: 'estudiante', 
    enum: rolesValidos, 
    description: 'Rol (Habilitado para pruebas)' 
  })
  @IsOptional() // Opcional: si no lo envían, asignaremos estudiante por defecto
  @IsEnum(rolesValidos)
  rol?: string;
}