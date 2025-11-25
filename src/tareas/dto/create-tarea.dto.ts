// src/tareas/dto/create-tarea.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { PrioridadTarea, EstadoTarea } from '../tarea.enums';

export class CreateTareaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaEntrega?: string;
  
  // Asignamos prioridad y estado por defecto en el servicio, 
  // pero permitimos que se envíen opcionalmente.
  @IsEnum(PrioridadTarea)
  @IsOptional()
  prioridad?: PrioridadTarea;

  @IsEnum(EstadoTarea)
  @IsOptional()
  estado?: EstadoTarea;
}