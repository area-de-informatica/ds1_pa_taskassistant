// src/tareas/tareas.controller.ts

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
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
    // ParseMongoIdPipe, // <-- REEMPLAZO IMPORTANTE
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { TareasService } from './tareas.service';

// --- DTOs (Estos no cambian) ---
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { AssignTareaDto } from './dto/assign-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { LogTiempoDto } from './dto/log-tiempo.dto';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { CreateRecursoLinkDto } from './dto/create-recurso-link.dto';
import { LinkEtiquetaDto } from './dto/link-etiqueta.dto';

// --- Seguridad ---
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

@UseGuards(JwtAuthGuard)
@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  // (RF-001) Crear Tarea
  @Post()
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  create(@Body() createTareaDto: CreateTareaDto, @Request() req) {
    return this.tareasService.create(req.user.userId, createTareaDto);
  }

  // (RF-001) Obtener mis Tareas
  @Get()
  findAll(@Request() req) {
    return this.tareasService.findAll(req.user);
  }

  // (RF-001) Obtener una Tarea
  @Get(':tareaId')
  findOne(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Request() req,
  ) {
    return this.tareasService.findOne(tareaId, req.user);
  }

  // (RF-005) Actualizar Tarea
  @Patch(':tareaId')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  update(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() updateTareaDto: UpdateTareaDto,
    @Request() req,
  ) {
    return this.tareasService.update(tareaId, updateTareaDto, req.user);
  }

  // (RF-001) Borrar Tarea
  @Delete(':tareaId')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  remove(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Request() req,
  ) {
    return this.tareasService.remove(tareaId, req.user);
  }

  // (RF-006) Asignar Tarea
  @Post(':tareaId/asignar')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  assign(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() assignTareaDto: AssignTareaDto,
    @Request() req,
  ) {
    return this.tareasService.assign(
      tareaId,
      assignTareaDto.idUsuario,
      req.user.userId,
    );
  }

  // (RF-011) Actualizar Progreso
  @Patch(':tareaId/progreso')
  @HttpCode(HttpStatus.OK)
  updateProgreso(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() updateProgresoDto: UpdateProgresoDto,
    @Request() req,
  ) {
    return this.tareasService.updateProgreso(
      tareaId,
      req.user.userId,
      updateProgresoDto,
    );
  }

  // (RF-012) Registrar Tiempo
  @Post(':tareaId/tiempo')
  logTiempo(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() logTiempoDto: LogTiempoDto,
    @Request() req,
  ) {
    return this.tareasService.logTiempo(
      tareaId,
      req.user.userId,
      logTiempoDto,
    );
  }

  // (RF-020) Calificar Tarea
  @Post(':tareaId/calificar')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  calificar(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() createCalificacionDto: CreateCalificacionDto,
    @Request() req,
  ) {
    return this.tareasService.calificar(
      tareaId,
      req.user.userId,
      createCalificacionDto,
    );
  }

  // (RF-010) Adjuntar Link
  @Post(':tareaId/recursos/link')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  addLinkRecurso(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Body() createRecursoLinkDto: CreateRecursoLinkDto,
  ) {
    return this.tareasService.addLinkRecurso(tareaId, createRecursoLinkDto);
  }

  // (RF-010) Subir Archivo
  @Post(':tareaId/recursos/upload')
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  addFileRecurso(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.tareasService.addFileRecurso(tareaId, file);
  }
  
  // (RF-016) Anclar Tarea
  @Post(':tareaId/anclar')
  @HttpCode(HttpStatus.CREATED)
  anclarTarea(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Request() req,
  ) {
    return this.tareasService.anclar(req.user.userId, tareaId);
  }

  // (RF-016) Desanclar Tarea
  @Delete(':tareaId/anclar')
  @HttpCode(HttpStatus.NO_CONTENT)
  desanclarTarea(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string, // <-- CAMBIO
    @Request() req,
  ) {
    return this.tareasService.desanclar(req.user.userId, tareaId);
  }

  // (RF-014 / RF-015) Vincular Etiqueta
  @Post(':tareaId/etiquetas/:tipo')
  @HttpCode(HttpStatus.CREATED)
  addEtiqueta(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string,
    @Param('tipo') tipo: 'color' | 'palabra',
    @Body() linkEtiquetaDto: LinkEtiquetaDto,
    @Request() req,
  ) {
    return this.tareasService.addEtiqueta(
      tareaId,
      linkEtiquetaDto.etiquetaId,
      tipo,
      req.user,
    );
  }

  // (RF-014 / RF-015) Desvincular Etiqueta
  @Delete(':tareaId/etiquetas/:tipo/:etiquetaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEtiqueta(
    @Param('tareaId', ParseMongoIdPipe) tareaId: string,
    @Param('tipo') tipo: 'color' | 'palabra',
    @Param('etiquetaId', ParseMongoIdPipe) etiquetaId: string,
    @Request() req,
  ) {
    return this.tareasService.removeEtiqueta(
      tareaId,
      etiquetaId,
      tipo,
      req.user,
    );
  }
}