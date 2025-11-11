// src/metas/metas.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetaDto } from './dto/create-meta.dto';

@Injectable()
export class MetasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateMetaDto) {
    return this.prisma.meta.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.meta.findMany({
      include: {
        tareas: { include: { tarea: true } }, // Cargar las tareas vinculadas
      },
    });
  }

  async remove(id: string) {
    try {
      // (En MongoDB, borrar una Meta no borra en cascada las MetaTarea,
      // tendrías que borrarlas a mano si fuera necesario)
      return await this.prisma.meta.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Meta no encontrada');
    }
  }

  // --- Vinculación de Tareas ---

  async vincularTarea(metaId: string, tareaId: string) {
    try {
      return await this.prisma.metaTarea.create({
        data: {
          metaId: metaId,
          tareaId: tareaId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint (si ya existe)
        throw new ForbiddenException('La tarea ya está vinculada a esta meta');
      }
      if (error.code === 'P2003' || error.code === 'P2025') {
        throw new NotFoundException('Meta o Tarea no encontrada');
      }
      throw error;
    }
  }

  async desvincularTarea(metaId: string, tareaId: string) {
    try {
      // Prisma necesita un ID único para borrar, en `MetaTarea` es `id`
      // Primero debemos buscar el registro
      const metaTarea = await this.prisma.metaTarea.findFirst({
        where: { metaId, tareaId },
      });

      if (!metaTarea) {
        throw new NotFoundException('Vinculación no encontrada');
      }

      await this.prisma.metaTarea.delete({
        where: { id: metaTarea.id },
      });
    } catch (error) {
      throw new NotFoundException('Vinculación no encontrada');
    }
  }
}