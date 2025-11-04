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
} from '@nestjs/common';
import { TareasService } from './tareas.service';

// --- DTOs (Data Transfer Objects) ---
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { AssignTareaDto } from './dto/assign-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto'; // <-- NUEVO
import { LogTiempoDto } from './dto/log-tiempo.dto'; // <-- NUEVO

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

  // --- NUEVOS ENDPOINTS ---

  /**
   * (RF-011) Actualizar el porcentaje de progreso de una tarea.
   * Lo puede hacer cualquier usuario ASIGNADO a la tarea.
   */
  @Patch(':tareaId/progreso')
  @HttpCode(HttpStatus.OK)
  updateProgreso(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() updateProgresoDto: UpdateProgresoDto,
    @Request() req, // Sacamos el userId del token
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
    @Request() req, // Sacamos el userId del token
  ) {
    return this.tareasService.logTiempo(
      tareaId,
      req.user.userId,
      logTiempoDto,
    );
  }
}