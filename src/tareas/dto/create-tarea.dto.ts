// src/tareas/dto/create-tarea.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsBoolean, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ description: 'Si la tarea requiere subir archivo', example: true })
  @IsOptional()
  @IsBoolean()
  requiereArchivo?: boolean;

  @ApiProperty({ description: 'ID del estudiante a asignar', example: '65a1f2c3d4e5f6g7h8i9j0k1' })
  @IsOptional()
  @IsMongoId()
  asignadoId?: string;
}
