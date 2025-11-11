// src/etiquetas/dto/create-etiqueta-color.dto.ts

import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateEtiquetaColorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string; // Ej: "Urgente"

  @IsString()
  @IsNotEmpty()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un código hexadecimal (ej: #FF0000)' })
  colorHex: string; // Ej: "#FF0000"
}