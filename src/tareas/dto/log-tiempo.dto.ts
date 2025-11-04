// src/tareas/dto/log-tiempo.dto.ts

import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class LogTiempoDto {
  // RF-012: Minutos a registrar
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  minutos: number;
}