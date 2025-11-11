// src/metas/dto/create-meta.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMetaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}