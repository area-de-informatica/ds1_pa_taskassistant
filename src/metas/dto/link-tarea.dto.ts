// src/metas/dto/link-tarea.dto.ts
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class LinkTareaDto {
  @IsMongoId() // Específico para MongoDB
  @IsNotEmpty()
  tareaId: string;
}