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
import { MetasService } from './metas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client'; // (Asegúrate de tener este Enum)
import { CreateMetaDto } from './dto/create-meta.dto';
import { LinkTareaDto } from './dto/link-tarea.dto';

@UseGuards(JwtAuthGuard)
@Controller('metas')
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Post()
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  create(@Body() createMetaDto: CreateMetaDto) {
    return this.metasService.create(createMetaDto);
  }

  @Get()
  findAll() {
    // Todos pueden ver las metas
    return this.metasService.findAll();
  }

  @Delete(':id')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.metasService.remove(id);
  }

  // --- Vinculación de Tareas ---

  @Post(':metaId/vincular-tarea')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  vincularTarea(
    @Param('metaId') metaId: string,
    @Body() linkTareaDto: LinkTareaDto,
  ) {
    return this.metasService.vincularTarea(metaId, linkTareaDto.tareaId);
  }

  @Delete(':metaId/vincular-tarea/:tareaId')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  desvincularTarea(
    @Param('metaId') metaId: string,
    @Param('tareaId') tareaId: string,
  ) {
    return this.metasService.desvincularTarea(metaId, tareaId);
  }
}