// src/etiquetas/etiquetas.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EtiquetasService } from './etiquetas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '@prisma/client';
import { CreateEtiquetaColorDto } from './dto/create-etiqueta-color.dto';
import { CreateEtiquetaPalabraDto } from './dto/create-etiqueta-palabra.dto';

@UseGuards(JwtAuthGuard) // Todo este módulo requiere autenticación
@Controller('etiquetas')
export class EtiquetasController {
  constructor(private readonly etiquetasService: EtiquetasService) {}

  // --- ETIQUETAS DE COLOR ---

  @Post('color')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal) // Solo docentes/admin
  @UseGuards(RolesGuard)
  createColor(@Body() createDto: CreateEtiquetaColorDto, @Request() req) {
    return this.etiquetasService.createColor(createDto, req.user.userId);
  }

  @Get('color')
  findAllColor() {
    return this.etiquetasService.findAllColor(); // Todos pueden ver la lista
  }

  @Delete('color/:id')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal) // Solo docentes/admin
  @UseGuards(RolesGuard)
  removeColor(@Param('id', ParseUUIDPipe) id: string) {
    return this.etiquetasService.removeColor(id);
  }

  // --- ETIQUETAS DE PALABRA CLAVE ---

  @Post('palabraclave')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  createPalabra(@Body() createDto: CreateEtiquetaPalabraDto, @Request() req) {
    return this.etiquetasService.createPalabra(createDto, req.user.userId);
  }

  @Get('palabraclave')
  findAllPalabra() {
    return this.etiquetasService.findAllPalabra(); // Todos pueden ver la lista
  }

  @Delete('palabraclave/:id')
  @Roles(RolUsuario.administrador, RolUsuario.docente_principal)
  @UseGuards(RolesGuard)
  removePalabra(@Param('id', ParseUUIDPipe) id: string) {
    return this.etiquetasService.removePalabra(id);
  }
}