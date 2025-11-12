// src/etiquetas/etiquetas.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { EtiquetasService } from './etiquetas.service';

// --- Seguridad ---
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// --- DTOs ---
import { CreateEtiquetaPalabraDto } from './dto/create-etiqueta-palabra.dto';
import { CreateEtiquetaColorDto } from './dto/create-etiqueta-color.dto';

type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

@ApiBearerAuth()
@ApiTags('Etiquetas')
@UseGuards(JwtAuthGuard)
@Controller('etiquetas')
export class EtiquetasController {
  constructor(private readonly etiquetasService: EtiquetasService) {}

  // --- ETIQUETAS DE PALABRA CLAVE ---

  @Post('palabra')
  @ApiOperation({ summary: 'Crear una etiqueta de palabra clave' })
  @ApiResponse({ status: 201, description: 'Etiqueta de palabra creada.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  createPalabra(@Body() dto: CreateEtiquetaPalabraDto) {
    return this.etiquetasService.createPalabra(dto);
  }

  @Get('palabra')
  @ApiOperation({ summary: 'Obtener todas las etiquetas de palabra clave' })
  @ApiResponse({ status: 200, description: 'Lista de etiquetas de palabra.' })
  findAllPalabra() {
    return this.etiquetasService.findAllPalabra();
  }

  @Delete('palabra/:id')
  @ApiOperation({ summary: 'Eliminar una etiqueta de palabra clave por ID' })
  @ApiResponse({ status: 204, description: 'Etiqueta de palabra eliminada.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiResponse({ status: 404, description: 'Etiqueta de palabra no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID de la etiqueta de palabra', type: String })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removePalabra(@Param('id', ParseMongoIdPipe) id: string) {
    return this.etiquetasService.removePalabra(id);
  }

  // --- ETIQUETAS DE COLOR ---

  @Post('color')
  @ApiOperation({ summary: 'Crear una etiqueta de color' })
  @ApiResponse({ status: 201, description: 'Etiqueta de color creada.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  createColor(@Body() dto: CreateEtiquetaColorDto) {
    return this.etiquetasService.createColor(dto);
  }

  @Get('color')
  @ApiOperation({ summary: 'Obtener todas las etiquetas de color' })
  @ApiResponse({ status: 200, description: 'Lista de etiquetas de color.' })
  findAllColor() {
    return this.etiquetasService.findAllColor();
  }

  @Delete('color/:id')
  @ApiOperation({ summary: 'Eliminar una etiqueta de color por ID' })
  @ApiResponse({ status: 204, description: 'Etiqueta de color eliminada.' })
  @ApiResponse({ status: 403, description: 'Rol no autorizado.' })
  @ApiResponse({ status: 404, description: 'Etiqueta de color no encontrada.' })
  @ApiParam({ name: 'id', description: 'ID de la etiqueta de color', type: String })
  @Roles('administrador', 'docente_principal')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeColor(@Param('id', ParseMongoIdPipe) id: string) {
    return this.etiquetasService.removeColor(id);
  }
}