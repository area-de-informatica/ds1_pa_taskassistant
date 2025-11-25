// src/etiquetas/dto/create-etiqueta-palabra.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEtiquetaPalabraDto {
  @IsString()
  @IsNotEmpty()
  palabra: string; // Ej: "Frontend"
}