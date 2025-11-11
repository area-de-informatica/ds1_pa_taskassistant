// src/tareas/dto/create-calificacion.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateCalificacionDto {
  /**
   * (RF-020) Escala 0-100
   */
  @IsInt()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  puntaje: number;

  /**
   * (RF-020) Retroalimentación textual
   */
  @IsString()
  @IsOptional()
  nota?: string;
}