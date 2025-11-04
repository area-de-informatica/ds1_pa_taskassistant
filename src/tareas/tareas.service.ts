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

// --- Tipos de Prisma ---
import { EstadoTarea, PrioridadTarea, RolUsuario } from '@prisma/client';

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
   */
  async create(
    proyectoId: string,
    idUsuarioCreador: string,
    createTareaDto: CreateTareaDto,
  ) {
    // (Añadir lógica de autorización: verificar si el usuario pertenece al proyecto)

    return this.prisma.tarea.create({
      data: {
        ...createTareaDto,
        estado: createTareaDto.estado || EstadoTarea.nueva,
        prioridad: createTareaDto.prioridad || PrioridadTarea.baja,
        proyecto: {
          connect: { id: proyectoId },
        },
        usuarioCreador: {
          connect: { id: idUsuarioCreador },
        },
      },
    });
  }

  /**
   * (RF-001) Leer Tareas (solo activas)
   */
  async findAll(proyectoId: string, user: userPayload) {
    // (Añadir lógica de autorización: verificar si user.userId tiene acceso a proyectoId)

    return this.prisma.tarea.findMany({
      where: {
        idProyecto: proyectoId,
        eliminada: null, // No mostrar las de la papelera
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });
  }

  /**
   * (RF-001) Leer una Tarea (solo activa)
   */
  async findOne(tareaId: string, user: userPayload) {
    const tarea = await this.prisma.tarea.findUnique({
      where: {
        id: tareaId,
        eliminada: null, // Solo encontrar si está activa
      },
      include: {
        comentarios: true,
        recursos: true,
        asignaciones: true,
      },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada o está en la papelera');
    }

    // (Añadir lógica de autorización: verificar si el usuario puede ver esta tarea)

    return tarea;
  }

  /**
   * (RF-005) Actualizar Tarea
   */
  async update(
    tareaId: string,
    updateTareaDto: UpdateTareaDto,
    user: userPayload,
  ) {
    try {
      // (Añadir lógica de autorización: verificar si el usuario es dueño del proyecto)

      return await this.prisma.tarea.update({
        where: { id: tareaId },
        data: updateTareaDto,
      });
    } catch (error) {
      // (error.code === 'P2025' es el código de Prisma para "Registro no encontrado")
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-001 Delete) Enviar Tarea a Papelera (Soft Delete)
   */
  async remove(tareaId: string, user: userPayload) {
    // (Añadir lógica de autorización)

    try {
      return await this.prisma.tarea.update({
        where: { id: tareaId },
        data: {
          eliminada: new Date(), // Marcar la fecha de eliminación
        },
      });
    } catch (error) {
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-002) Recuperar Tarea desde la Papelera
   */
  async recover(tareaId: string, user: userPayload) {
    // (Añadir lógica de autorización)

    // 1. Verificar si la tarea existe, incluso si está eliminada
    const tarea = await this.prisma.tarea.findUnique({
      where: { id: tareaId },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // 2. Verificar si la tarea está realmente en la papelera
    if (tarea.eliminada === null) {
      throw new ForbiddenException('La tarea no está eliminada');
    }

    // (Lógica de 30 días:
    // const diasEliminada = (new Date().getTime() - tarea.eliminada.getTime()) / (1000 * 3600 * 24);
    // if (diasEliminada > 30) { ... } )

    // 3. Restaurar la tarea
    return this.prisma.tarea.update({
      where: { id: tareaId },
      data: {
        eliminada: null, // Quitar la marca de eliminación
      },
    });
  }

  /**
   * (RF-006) Asignar Tarea a un Usuario
   */
  async assign(
    tareaId: string,
    idUsuarioAsignado: string,
    idUsuarioAsignador: string,
  ) {
    // (Añadir lógica de autorización:
    // 1. Verificar que 'tareaId' y 'idUsuarioAsignado' existan.
    // 2. Verificar que 'idUsuarioAsignado' tenga rol 'estudiante'.
    // 3. Verificar que ambos pertenezcan al mismo proyecto.)

    try {
      const asignacion = await this.prisma.asignacionTarea.create({
        data: {
          idTarea: tareaId,
          idUsuario: idUsuarioAsignado,
          asignadaPorId: idUsuarioAsignador,
        },
      });

      // (RF-021: Disparar una notificación aquí)

      return asignacion;
    } catch (error) {
      // Manejar error si la asignación ya existe (Clave Primaria duplicada)
      if (error.code === 'P2002') {
        throw new ForbiddenException('El usuario ya está asignado a esta tarea');
      }
      throw new NotFoundException('Tarea o Usuario no encontrado');
    }
  }

  /**
   * (RF-011) Actualizar Progreso Individual (y estado de la Tarea)
   */
  async updateProgreso(
    tareaId: string,
    userId: string,
    updateProgresoDto: UpdateProgresoDto,
  ) {
    // 1. Autorización: Verificar que el usuario esté asignado a la tarea
    await this.checkIfUserIsAssigned(tareaId, userId);

    const { porcentaje } = updateProgresoDto;
    let nuevoEstadoTarea = undefined;

    // 2. Lógica de RF-011: Cambiar estado de la tarea según el progreso
    if (porcentaje === 100) {
      nuevoEstadoTarea = EstadoTarea.completada;
    } else if (porcentaje > 0) {
      nuevoEstadoTarea = EstadoTarea.en_progreso;
    } else {
      nuevoEstadoTarea = EstadoTarea.nueva;
    }

    // 3. Usamos una transacción para actualizar ambas tablas (Progreso y Tarea)
    try {
      const [progreso] = await this.prisma.$transaction([
        // Paso A: Actualizar o crear el registro de progreso individual
        this.prisma.progreso.upsert({
          where: {
            // Esto requiere un constraint @@unique([idTarea, idUsuario])
            idTarea_idUsuario: { idTarea: tareaId, idUsuario: userId },
          },
          update: {
            porcentaje: porcentaje,
            fechaActualizacion: new Date(),
          },
          create: {
            idTarea: tareaId,
            idUsuario: userId,
            porcentaje: porcentaje,
          },
        }),
        // Paso B: Actualizar el estado de la Tarea principal
        this.prisma.tarea.update({
          where: { id: tareaId },
          data: {
            estado: nuevoEstadoTarea,
            // (Opcional: aquí podrías calcular el % general de la tarea si hay varios asignados)
          },
        }),
      ]);
      return progreso;
    } catch (error) {
      throw new NotFoundException('Tarea no encontrada');
    }
  }

  /**
   * (RF-012) Registrar Tiempo en Tarea
   */
  async logTiempo(
    tareaId: string,
    userId: string,
    logTiempoDto: LogTiempoDto,
  ) {
    // 1. Autorización: Verificar que el usuario esté asignado a la tarea
    await this.checkIfUserIsAssigned(tareaId, userId);

    // 2. Crear el registro de tiempo
    return this.prisma.registroTiempo.create({
      data: {
        idTarea: tareaId,
        idUsuario: userId,
        minutos: logTiempoDto.minutos,
        // 'fecha' se establece por defecto (según tu esquema)
      },
    });
  }

  // --- MÉTODO HELPER DE AUTORIZACIÓN ---

  /**
   * Verifica si un usuario está asignado a una tarea.
   * Lanza un ForbiddenException si no lo está.
   * Cumple con RF-012: "el Estudiante solo en sus tareas".
   */
  private async checkIfUserIsAssigned(tareaId: string, userId: string) {
    const asignacion = await this.prisma.asignacionTarea.findUnique({
      where: {
        idTarea_idUsuario: {
          idTarea: tareaId,
          idUsuario: userId,
        },
      },
    });

    if (!asignacion) {
      throw new ForbiddenException(
        'No tienes permiso para registrar progreso o tiempo en esta tarea (no estás asignado)',
      );
    }
  }
}

/**
 * NOTA DE IMPLEMENTACIÓN:
 * * Para que el método `updateProgreso` funcione con `upsert` eficientemente,
 * tu `schema.prisma` en el modelo `Progreso` debe tener un constraint único
 * que combine `idTarea` y `idUsuario`.
 *
 * model Progreso {
 * id        String   @id @default(uuid())
 * idTarea   String
 * idUsuario String
 * porcentaje Int
 * fechaActualizacion DateTime @updatedAt
 *
 * // ...relaciones...
 *
 * @@unique([idTarea, idUsuario], name: "idTarea_idUsuario") // <-- AÑADIR ESTO
 * }
 */