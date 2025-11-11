import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// --- DTOs ---
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { LogTiempoDto } from './dto/log-tiempo.dto';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { CreateRecursoLinkDto } from './dto/create-recurso-link.dto';
import { LinkEtiquetaDto } from './dto/link-etiqueta.dto';

// --- Tipos de Prisma ---
// (Asegúrate de tener estos Enums definidos en tu schema.prisma o importarlos de otro lugar)
// Por ahora, usaremos strings basados en tu esquema
enum EstadoTarea {
  nueva = 'pendiente', // Asumo que "pendiente" es el inicial
  en_progreso = 'en_progreso',
  completada = 'completada',
  archivada = 'archivada', // No está en tu esquema, lo omitiremos
}

enum TipoRecurso {
  pdf = 'pdf',
  img = 'img',
  video = 'video',
  link = 'link',
  otro = 'otro',
}
// (Tu esquema de Mongo no tiene PrioridadTarea, RolUsuario en Prisma,
// así que los manejaremos como strings)
type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

// Payload del usuario decodificado del JWT
type userPayload = {
  userId: string;
  email: string;
  rol: RolUsuario;
};

@Injectable()
export class TareasService {
  constructor(private prisma: PrismaService) {}

  /**
   * (RF-001) Crear Tarea
   * (Adaptado a Mongo: asignadoId es null al crear)
   */
  async create(
    proyectoId: string, // (Tu esquema no tiene Proyecto, adaptaré)
    idUsuarioCreador: string,
    createTareaDto: CreateTareaDto,
  ) {
    return this.prisma.tarea.create({
      data: {
        titulo: createTareaDto.titulo,
        descripcion: createTareaDto.descripcion || '',
        estado: EstadoTarea.nueva,
        prioridad: createTareaDto.prioridad || 'baja', // Asumiendo campo 'prioridad'
        creadorId: idUsuarioCreador,
        asignadoId: null, // Nadie asignado al crear
        fechaVencimiento: createTareaDto.fechaEntrega ? new Date(createTareaDto.fechaEntrega) : null,
        // (proyectoId no está en tu esquema de Tarea)
      },
    });
  }

  /**
   * (RF-001) Leer Tareas
   * (Adaptado a Mongo)
   */
  async findAll(proyectoId: string, user: userPayload) {
    // (Tu esquema no filtra por proyecto, así que buscaremos
    // tareas asignadas al usuario o creadas por él)
    return this.prisma.tarea.findMany({
      where: {
        OR: [
          { creadorId: user.userId }, 
          { asignadoId: user.userId }
        ],
        // eliminada: null, // (Tu esquema no tiene soft delete)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * (RF-001) Leer una Tarea
   * (Adaptado a Mongo)
   */
  async findOne(tareaId: string, user: userPayload) {
    const tarea = await this.prisma.tarea.findUnique({
      where: {
        id: tareaId,
        // eliminada: null, 
      },
      include: {
        comentarios: true,
        // (Tu esquema no tiene 'recursos')
        etiquetas: { include: { etiquetaColor: true, etiquetaPalabra: true } },
        metas: { include: { meta: true } },
        asignado: { select: { id: true, nombre: true, email: true } },
        creador: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }
    // (Lógica de autorización: ¿puede el usuario ver esta tarea?)
    if (tarea.creadorId !== user.userId && tarea.asignadoId !== user.userId && user.rol !== 'administrador') {
       throw new ForbiddenException('No tienes permiso para ver esta tarea');
    }
    return tarea;
  }

  /**
   * (RF-005) Actualizar Tarea
   * (Adaptado a Mongo)
   */
  async update(
    tareaId: string,
    updateTareaDto: UpdateTareaDto, // (DTO necesitaría ser adaptado a tu esquema)
    user: userPayload,
  ) {
    // (Añadir lógica de autorización: solo creador o admin puede editar)
    try {
      return await this.prisma.tarea.update({
        where: { id: tareaId },
        data: {
          titulo: updateTareaDto.titulo,
          descripcion: updateTareaDto.descripcion,
          estado: updateTareaDto.estado,
          prioridad: updateTareaDto.prioridad,
          fechaVencimiento: updateTareaDto.fechaEntrega ? new Date(updateTareaDto.fechaEntrega) : undefined,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-001 Delete) Borrado Físico
   * (Adaptado a Mongo: tu esquema no tiene 'eliminada' para soft delete)
   */
  async remove(tareaId: string, user: userPayload) {
    // (Añadir lógica de autorización: solo creador o admin)
    try {
      // (CUIDADO: Esto es un borrado físico)
      return await this.prisma.tarea.delete({
        where: { id: tareaId },
      });
    } catch (error) {
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-002) Recuperar Tarea
   * (No aplicable a tu esquema Mongo, no hay soft delete)
   */
  // async recover(...) {}


  // --- MÉTODOS REFACTORIZADOS (MongoDB) ---

  /**
   * (RF-006) Asignar Tarea a un Usuario
   * (Refactorizado para Mongo: Actualiza el campo 'asignadoId' 1:N)
   */
  async assign(
    tareaId: string,
    idUsuarioAsignado: string,
    idUsuarioAsignador: string, // (Este ID ahora es solo para logs o notificaciones)
  ) {
    // (Lógica de autorización: verificar que idUsuarioAsignador sea admin/docente)
    try {
      return await this.prisma.tarea.update({
        where: { id: tareaId },
        data: {
          asignadoId: idUsuarioAsignado,
          // (Opcional: resetear progreso al re-asignar)
          // progreso: 0, 
        },
      });
      // (RF-021: Disparar una notificación aquí)
    } catch (error) {
      throw new NotFoundException('Tarea o Usuario no encontrado');
    }
  }

  /**
   * (RF-011) Actualizar Progreso Individual
   * (Refactorizado para Mongo: Actualiza el campo 'progreso' en la Tarea)
   */
  async updateProgreso(
    tareaId: string,
    userId: string, // ID del usuario que reporta el progreso
    updateProgresoDto: UpdateProgresoDto,
  ) {
    // 1. Autorización: Verificar que el usuario esté asignado a la tarea
    await this.checkIfUserIsAssigned(tareaId, userId);

    const { porcentaje } = updateProgresoDto;
    let nuevoEstadoTarea = EstadoTarea.nueva;

    // 2. Lógica de RF-011: Cambiar estado de la tarea según el progreso
    if (porcentaje === 100) {
      nuevoEstadoTarea = EstadoTarea.completada;
    } else if (porcentaje > 0) {
      nuevoEstadoTarea = EstadoTarea.en_progreso;
    }

    // 3. Actualizar la Tarea (no se necesita transacción)
    try {
      return await this.prisma.tarea.update({
        where: { id: tareaId },
        data: {
          progreso: porcentaje,
          estado: nuevoEstadoTarea,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-012) Registrar Tiempo en Tarea
   * (Refactorizado para Mongo: Incrementa el campo 'tiempoRegistrado' en la Tarea)
   */
  async logTiempo(
    tareaId: string,
    userId: string,
    logTiempoDto: LogTiempoDto,
  ) {
    // 1. Autorización: Verificar que el usuario esté asignado a la tarea
    await this.checkIfUserIsAssigned(tareaId, userId);

    // 2. Incrementar el tiempo atómicamente
    return this.prisma.tarea.update({
      where: { id: tareaId },
      data: {
        tiempoRegistrado: {
          increment: logTiempoDto.minutos,
        },
      },
    });
  }

  // --- FIN DE MÉTODOS REFACTORIZADOS ---

  /**
   * (RF-020) Calificar una Tarea
   * (AÚN NO IMPLEMENTADO - Requiere modificar el schema.prisma)
   */
  async calificar(
    // ... (lógica futura)
  ) {
     throw new Error('Funcionalidad no implementada. El esquema de Mongo debe ser actualizado.');
  }


  /**
   * (RF-010) Recursos (Enlaces y Archivos)
   * (AÚN NO IMPLEMENTADO - Requiere modificar el schema.prisma)
   */
  // async addLinkRecurso(...) {}
  // async addFileRecurso(...) {}


  /**
   * (RF-014/RF-015) Gestión de Etiquetas
   * (Lógica adaptada a tu esquema 'EtiquetaTarea')
   */
  async addEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra') {
    // (Autorización)
    try {
      return await this.prisma.etiquetaTarea.create({
        data: {
          tareaId: tareaId,
          etiquetaPalabraId: tipo === 'palabra' ? etiquetaId : undefined,
          etiquetaColorId: tipo === 'color' ? etiquetaId : undefined,
        },
      });
    } catch (error) { /* ... manejo de errores ... */ }
  }

  async removeEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra') {
     // (Autorización)
    try {
      const relacion = await this.prisma.etiquetaTarea.findFirst({
         where: { 
           tareaId: tareaId,
           [tipo === 'color' ? 'etiquetaColorId' : 'etiquetaPalabraId']: etiquetaId,
         }
      });
      if (!relacion) throw new NotFoundException('Relación no encontrada');
      
      await this.prisma.etiquetaTarea.delete({ where: { id: relacion.id } });
    } catch (error) { /* ... manejo de errores ... */ }
  }


  /**
   * (RF-016) Anclar Tarea
   * (AÚN NO IMPLEMENTADO - Requiere modificar el schema.prisma)
   */
  // async anclar(...) {}
  // async desanclar(...) {}


  // --- HELPER REFACTORIZADO (MongoDB) ---

  /**
   * Verifica si un usuario está asignado a una tarea.
   * Lanza un ForbiddenException si no lo está.
   * (Refactorizado para Mongo: comprueba el campo 'asignadoId')
   */
  private async checkIfUserIsAssigned(tareaId: string, userId: string) {
    const tarea = await this.prisma.tarea.findUnique({
      where: {
        id: tareaId,
      },
      select: {
        asignadoId: true,
      },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (tarea.asignadoId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para esta acción (no estás asignado a la tarea)',
      );
    }
  }
}