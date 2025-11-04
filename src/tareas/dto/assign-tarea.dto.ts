// src/tareas/dto/assign-tarea.dto.ts

import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTareaDto {
  @IsUUID()
  @IsNotEmpty()
  idUsuario: string; // El ID del estudiante a asignar
}