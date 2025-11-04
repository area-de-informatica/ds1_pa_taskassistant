// src/tareas/dto/update-progreso.dto.ts

import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateProgresoDto {
  // RF-011: Porcentaje de avance (0-100)
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  porcentaje: number;
}