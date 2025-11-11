// src/tareas/dto/link-etiqueta.dto.ts

import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class LinkEtiquetaDto {
  @IsUUID()
  @IsNotEmpty()
  etiquetaId: string;
}