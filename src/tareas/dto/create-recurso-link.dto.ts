// src/tareas/dto/create-recurso-link.dto.ts

import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateRecursoLinkDto {
  
  @IsString()
  @IsNotEmpty()
  nombre: string; // Ej: "Documentación Oficial de NestJS"

  @IsUrl() // Valida que sea una URL válida
  @IsNotEmpty()
  url: string; // Ej: "https://nestjs.com"
}