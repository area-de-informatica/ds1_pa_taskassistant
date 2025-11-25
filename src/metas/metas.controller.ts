// src/metas/metas.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MetasService } from './metas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { CreateMetaDto } from './dto/create-meta.dto';
import { LinkTareaDto } from './dto/link-tarea.dto';

@ApiBearerAuth()
@ApiTags('Metas')
@UseGuards(JwtAuthGuard)
@Controller('metas')
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva meta' })
  @ApiResponse({ status: 201, description: 'Meta creada exitosamente.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  create(@Body() createMetaDto: CreateMetaDto) {
    return this.metasService.create(createMetaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las metas' })
  @ApiResponse({ status: 200, description: 'Lista de metas.' })
  findAll() {
    return this.metasService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una meta por ID' })
  @ApiResponse({ status: 204, description: 'Meta eliminada.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiResponse({ status: 404, description: 'Meta no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID de la meta', type: String })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.metasService.remove(id);
  }

  // --- Vinculación de Tareas ---

  @Post(':metaId/vincular-tarea')
  @ApiOperation({ summary: 'Vincular una tarea a una meta' })
  @ApiResponse({ status: 201, description: 'Tarea vinculada a la meta.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiParam({ name: 'metaId', description: 'ID de la meta', type: String })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  vincularTarea(
    @Param('metaId', ParseMongoIdPipe) metaId: string,
    @Body() linkTareaDto: LinkTareaDto,
  ) {
    return this.metasService.vincularTarea(metaId, linkTareaDto.tareaId);
  }

  @Delete(':metaId/vincular-tarea/:tareaId')
  @ApiOperation({ summary: 'Desvincular una tarea de una meta' })
  @ApiResponse({ status: 204, description: 'Tarea desvinculada de la meta.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiParam({ name: 'metaId', description: 'ID de la meta', type: String })
  @ApiParam({ name: 'tareaId', description: 'ID de la tarea', type: String })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  desvincularTarea(
    @Param('metaId', ParseMongoIdPipe) metaId: string,
    @Param('tareaId', ParseMongoIdPipe) tareaId: string,
  ) {
    return this.metasService.desvincularTarea(metaId, tareaId);
  }
}