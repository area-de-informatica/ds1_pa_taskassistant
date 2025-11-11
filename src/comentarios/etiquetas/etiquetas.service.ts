// src/etiquetas/etiquetas.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEtiquetaColorDto } from './dto/create-etiqueta-color.dto';
import { CreateEtiquetaPalabraDto } from './dto/create-etiqueta-palabra.dto';

@Injectable()
export class EtiquetasService {
  constructor(private prisma: PrismaService) {}

  // --- Color ---
  createColor(dto: CreateEtiquetaColorDto, idUsuario: string) {
    return this.prisma.etiquetaColor.create({
      data: {
        ...dto,
        idUsuarioCreador: idUsuario,
      },
    });
  }

  findAllColor() {
    return this.prisma.etiquetaColor.findMany();
  }

  async removeColor(id: string) {
    try {
      return await this.prisma.etiquetaColor.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Etiqueta de color no encontrada');
    }
  }

  // --- Palabra Clave ---
  createPalabra(dto: CreateEtiquetaPalabraDto, idUsuario: string) {
    return this.prisma.etiquetaPalabraClave.create({
      data: {
        ...dto,
        idUsuarioCreador: idUsuario,
      },
    });
  }

  findAllPalabra() {
    return this.prisma.etiquetaPalabraClave.findMany();
  }

  async removePalabra(id: string) {
    try {
      return await this.prisma.etiquetaPalabraClave.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Etiqueta de palabra clave no encontrada');
    }
  }
}