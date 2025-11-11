import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TareasService } from './tareas.service';

// --- DTOs (Data Transfer Objects) ---
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { AssignTareaDto } from './dto/assign-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { LogTiempoDto } from './dto/log-tiempo.dto';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { CreateRecursoLinkDto } from './dto/create-recurso-link.dto';
import { LinkEtiquetaDto } from './dto/link-etiqueta.dto'; // (RF-014/RF-015)

// --- Seguridad (Guards, Decorators) ---
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// --- Tipos de Prisma ---
import { RolUsuario } from '@prisma/client';

/**
 * Controlador para Tareas.
 * Todas las rutas están protegidas por JWT.
 * Las rutas están anidadas bajo /proyectos/:proyectoId/tareas
 */
@UseGuards(JwtAuthGuard)
@Controller('proyectos/:proyectoId/tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  /**
   * (RF-001) Crear una nueva tarea en un proyecto.
   * Solo para Administradores y Docentes Principales.
   */
  @Post()
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  create(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Body() createTareaDto: CreateTareaDto,
    @Request() req,
  ) {
    const idUsuarioCreador = req.user.userId;
    return this.tareasService.create(
      proyectoId,
      idUsuarioCreador,
      createTareaDto,
    );
  }

  /**
   * (RF-001) Obtener todas las tareas (activas) de un proyecto.
   */
  @Get()
  findAll(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Request() req,
  ) {
    return this.tareasService.findAll(proyectoId, req.user);
  }

  /**
   * (RF-001) Obtener una tarea específica por ID.
   */
  @Get(':tareaId')
  findOne(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Request() req,
  ) {
    return this.tareasService.findOne(tareaId, req.user);
  }

  /**
   * (RF-005) Actualizar una tarea (ej. título, estado, fechas).
   * Solo para Administradores y Docentes Principales.
   */
  @Patch(':tareaId')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  update(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() updateTareaDto: UpdateTareaDto,
    @Request() req,
  ) {
    return this.tareasService.update(tareaId, updateTareaDto, req.user);
  }

  /**
   * (RF-001 Delete) Enviar una tarea a la papelera (Soft Delete).
   * Solo para Administradores y Docentes Principales.
   */
  @Delete(':tareaId')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  remove(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Request() req,
  ) {
    return this.tareasService.remove(tareaId, req.user);
  }

  /**
   * (RF-002) Recuperar una tarea de la papelera.
   * Solo para Administradores y Docentes Principales.
   */
  @Post(':tareaId/recuperar')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  recover(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Request() req,
  ) {
    return this.tareasService.recover(tareaId, req.user);
  }

  /**
   * (RF-006) Asignar una tarea a un usuario (estudiante).
   * Solo para Administradores y Docentes Principales.
   */
  @Post(':tareaId/asignar')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  assign(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() assignTareaDto: AssignTareaDto,
    @Request() req,
  ) {
    const idUsuarioAsignador = req.user.userId;
    return this.tareasService.assign(
      tareaId,
      assignTareaDto.idUsuario,
      idUsuarioAsignador,
    );
  }

  /**
   * (RF-011) Actualizar el porcentaje de progreso de una tarea.
   * Lo puede hacer cualquier usuario ASIGNADO a la tarea.
   */
  @Patch(':tareaId/progreso')
  @HttpCode(HttpStatus.OK)
  updateProgreso(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() updateProgresoDto: UpdateProgresoDto,
    @Request() req,
  ) {
    return this.tareasService.updateProgreso(
      tareaId,
      req.user.userId,
      updateProgresoDto,
    );
  }

  /**
   * (RF-012) Registrar tiempo en una tarea.
   * Lo puede hacer cualquier usuario ASIGNADO a la tarea.
   */
  @Post(':tareaId/tiempo')
  logTiempo(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() logTiempoDto: LogTiempoDto,
    @Request() req,
  ) {
    return this.tareasService.logTiempo(
      tareaId,
      req.user.userId,
      logTiempoDto,
    );
  }

 /**
   * (RF-020) Calificar una tarea completada
   * (Caso de Uso No. 19)
   * Solo para Administradores y Docentes Principales.
   */
  @Post(':tareaId/calificar')
  @Roles('administrador', 'docente_principal') // <-- Guardia de Rol
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  calificar(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- Pipe de Mongo
    @Body() createCalificacionDto: CreateCalificacionDto,
    @Request() req, // Para saber qué docente está calificando
  ) {
    const idUsuarioCalificador = req.user.userId;
    return this.tareasService.calificar(
      tareaId,
      idUsuarioCalificador,
      createCalificacionDto,
    );
  }


  /**
   * (RF-010) Adjuntar un ENLACE a una tarea
   * Solo para Administradores y Docentes Principales.
   */
  @Post(':tareaId/recursos/link')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  addLinkRecurso(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() createRecursoLinkDto: CreateRecursoLinkDto,
  ) {
    return this.tareasService.addLinkRecurso(tareaId, createRecursoLinkDto);
  }

  /**
   * (RF-010) Subir un ARCHIVO y adjuntarlo a una tarea
   * Solo para Administradores y Docentes Principales.
   */
  @Post(':tareaId/recursos/upload')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  addFileRecurso(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
  ) {
    return this.tareasService.addFileRecurso(tareaId, file, req.user);
  }

  /**
   * (RF-014) Vincular una etiqueta de color a una tarea
   * Todos los roles pueden etiquetar (según la matriz de permisos).
   */
  @Post(':tareaId/etiquetas/color')
  @HttpCode(HttpStatus.CREATED)
  addEtiquetaColor(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() linkEtiquetaDto: LinkEtiquetaDto,
    @Request() req,
  ) {
    return this.tareasService.addEtiquetaColor(
      tareaId,
      linkEtiquetaDto.etiquetaId,
      req.user,
    );
  }

  /**
   * (RF-014) Desvincular una etiqueta de color de una tarea
   * Todos los roles pueden etiquetar.
   */
  @Delete(':tareaId/etiquetas/color/:etiquetaId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  removeEtiquetaColor(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Param('etiquetaId', ParseUUIDPipe) etiquetaId: string,
    @Request() req,
  ) {
    return this.tareasService.removeEtiquetaColor(
      tareaId,
      etiquetaId,
      req.user,
    );
  }

  /**
   * (RF-015) Vincular una etiqueta de palabra clave a una tarea
   * Todos los roles pueden etiquetar.
   */
  @Post(':tareaId/etiquetas/palabraclave')
  @HttpCode(HttpStatus.CREATED)
  addEtiquetaPalabra(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() linkEtiquetaDto: LinkEtiquetaDto,
    @Request() req,
  ) {
    return this.tareasService.addEtiquetaPalabra(
      tareaId,
      linkEtiquetaDto.etiquetaId,
      req.user,
    );
  }

  /**
   * (RF-015) Desvincular una etiqueta de palabra clave de una tarea
   * Todos los roles pueden etiquetar.
   */
  @Delete(':tareaId/etiquetas/palabraclave/:etiquetaId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  removeEtiquetaPalabra(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Param('etiquetaId', ParseUUIDPipe) etiquetaId: string,
    @Request() req,
  ) {
    return this.tareasService.removeEtiquetaPalabra(
      tareaId,
      etiquetaId,
      req.user,
    );
  }
  @Post(':tareaId/anclar')
  @HttpCode(HttpStatus.CREATED)
  anclarTarea(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Request() req, // Usamos req.user.userId para saber QUIÉN ancla
  ) {
    return this.tareasService.anclar(req.user.userId, tareaId);
  }

  /**
   * (RF-016) Desanclar una tarea.
   * (Caso de Uso No. 25) - Todos los roles pueden.
   */
  @Delete(':tareaId/anclar')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  desanclarTarea(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Request() req, // Usamos req.user.userId
  ) {
    return this.tareasService.desanclar(req.user.userId, tareaId);
  }
  

}