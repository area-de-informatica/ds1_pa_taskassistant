import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

// Define los roles válidos según tu lógica
const rolesValidos = ['administrador', 'docente_principal', 'docente_invitado', 'estudiante'];

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan@correo.com', description: 'Correo electrónico único' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'pass1234', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'estudiante', enum: rolesValidos, description: 'Rol del usuario' })
  @IsString()
  @IsNotEmpty()
  @IsIn(rolesValidos)
  rol: string;
}