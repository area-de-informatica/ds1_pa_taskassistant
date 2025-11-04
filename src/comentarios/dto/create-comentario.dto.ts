// src/comentarios/dto/create-comentario.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;

  // RF-009: Aceptamos un array opcional de IDs de usuario para las menciones
  @IsArray()
  @IsUUID('4', { each: true }) // Valida que cada elemento del array sea un UUID
  @IsOptional()
  menciones?: string[]; // (ej: ["uuid-del-usuario-1", "uuid-del-usuario-2"])
}