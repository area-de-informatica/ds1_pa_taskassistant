// src/comentarios/comentarios.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ComentariosService } from './comentarios.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@ApiBearerAuth()
@ApiTags('Comentarios')
@UseGuards(JwtAuthGuard)
@Controller('tareas/:tareaId/comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post()
  @ApiOperation({ summary: 'Publicar un comentario en una tarea' })
  @ApiResponse({ status: 201, description: 'Comentario creado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada.' })
  @ApiParam({ name: 'tareaId', description: 'ID de la tarea', type: String })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string,
    @Body() createComentarioDto: CreateComentarioDto,
    @Request() req,
  ) {
    const idUsuarioAutor = req.user.userId;
    return this.comentariosService.create(
      tareaId,
      idUsuarioAutor,
      createComentarioDto
    );
  }
}