// src/comentarios/comentarios.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Todos los endpoints de comentarios requieren estar logueado
@Controller('proyectos/:proyectoId/tareas/:tareaId/comentarios') // Ruta anidada
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  /**
   * (RF-008) Publicar un comentario en una tarea
   * (RF-009) Gestionar @menciones
   */
  @Post()
  create(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req,
  ) {
    const idUsuarioAutor = req.user.userId; // ID del usuario logueado (del JWT)
    
    // (Ignoramos proyectoId por ahora, pero se usaría para validación)

    return this.comentariosService.create(
      tareaId, 
      idUsuarioAutor, 
      createComentarioDto
    );
  }

  // (Aquí irían los endpoints GET, PATCH, DELETE para comentarios)
}