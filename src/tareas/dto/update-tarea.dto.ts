// src/tareas/dto/update-tarea.dto.ts

import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PrioridadTarea, EstadoTarea } from '../tarea.enums';

// Para actualizar, todos los campos son opcionales
export class UpdateTareaDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;
  
  @IsEnum(PrioridadTarea)
  @IsOptional()
  prioridad?: PrioridadTarea;

  @IsEnum(EstadoTarea)
  @IsOptional()
  estado?: EstadoTarea;
}