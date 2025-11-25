// src/tareas/tareas.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // <-- Inyectar Modelo
import { Model } from 'mongoose'; // <-- Tipo Modelo

// --- Importar todos los Schemas y DTOs ---
import { Tarea, TareaDocument } from '../schemas/tarea.schema';
import { Calificacion, CalificacionDocument } from '../schemas/calificacion.schema';
import { Recurso, RecursoDocument } from '../schemas/recurso.schema';
import { Anclado, AncladoDocument } from '../schemas/anclado.schema';
import { EtiquetaTarea, EtiquetaTareaDocument } from '../schemas/etiqueta-tarea.schema';

import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { LogTiempoDto } from './dto/log-tiempo.dto';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { CreateRecursoLinkDto } from './dto/create-recurso-link.dto';

// --- Tipos/Enums (Strings para Mongo) ---
const EstadoTarea = {
  nueva: 'pendiente',
  en_progreso: 'en_progreso',
  completada: 'completada',
};

const TipoRecurso = {
  link: 'link',
  pdf: 'pdf',
  img: 'img',
  video: 'video',
  otro: 'otro',
};

type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

type userPayload = {
  userId: string;
  email: string;
  rol: RolUsuario;
};

@Injectable()
export class TareasService {
  constructor(
    // Inyectar todos los modelos que este servicio necesita
    @InjectModel(Tarea.name) private tareaModel: Model<TareaDocument>,
    @InjectModel(Calificacion.name) private calificacionModel: Model<CalificacionDocument>,
    @InjectModel(Recurso.name) private recursoModel: Model<RecursoDocument>,
    @InjectModel(Anclado.name) private ancladoModel: Model<AncladoDocument>,
    @InjectModel(EtiquetaTarea.name) private etiquetaTareaModel: Model<EtiquetaTareaDocument>,
  ) {}

  // (RF-001) Crear Tarea
  async create(idUsuarioCreador: string, dto: CreateTareaDto) {
    const nuevaTarea = new this.tareaModel({
      titulo: dto.titulo,
      descripcion: dto.descripcion || '',
      estado: EstadoTarea.nueva,
      prioridad: dto.prioridad || 'baja',
      progreso: 0,
      tiempoRegistrado: 0,
      creadorId: idUsuarioCreador,
      asignadoId: null,
      fechaVencimiento: dto.fechaEntrega ? new Date(dto.fechaEntrega) : null,
    });
    return nuevaTarea.save(); // <-- .save() en lugar de .create()
  }

  // (RF-001) Leer Tareas
  async findAll(user: userPayload) {
    return this.tareaModel.find({
      OR: [{ creadorId: user.userId }, { asignadoId: user.userId }],
    })
    .populate('asignado', 'id nombre')
    .populate('creador', 'id nombre')
    .sort({ createdAt: -1 })
    .exec();
  }

  // (RF-001) Leer una Tarea
  async findOne(tareaId: string, user: userPayload) {
    const tarea = await this.tareaModel.findById(tareaId)
      // .populate() reemplaza a 'include' de Prisma
      .populate('comentarios') 
      .populate({ path: 'etiquetas', populate: ['etiquetaColor', 'etiquetaPalabra']})
      .populate({ path: 'metas', populate: 'meta' })
      .populate('asignado', 'id nombre email')
      .populate('creador', 'id nombre email')
      .populate({
        path: 'calificaciones',
        populate: { path: 'calificador', select: 'id nombre' },
      })
      .populate('recursos')
      .exec();

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }
    
    // (Autorización)
    if (tarea.creadorId.toString() !== user.userId && 
        tarea.asignadoId?.toString() !== user.userId && 
        user.rol !== 'administrador') {
      throw new ForbiddenException('No tienes permiso para ver esta tarea');
    }
    return tarea;
  }

  // (RF-005) Actualizar Tarea
  async update(tareaId: string, dto: UpdateTareaDto, user: userPayload) {
    // (Añadir lógica de autorización)
    return this.tareaModel.findByIdAndUpdate(tareaId, {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        estado: dto.estado,
        prioridad: dto.prioridad,
        fechaVencimiento: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
    }, { new: true }).exec(); // { new: true } devuelve el documento actualizado
  }

  // (RF-001) Borrar Tarea
  async remove(tareaId: string, user: userPayload) {
    // (Añadir lógica de autorización)
    
    // (Borrado Físico - CUIDADO)
    // Deberías borrar manualmente calificaciones, recursos, etc.
    // await this.calificacionModel.deleteMany({ tareaId });
    // await this.recursoModel.deleteMany({ tareaId });
    // ...etc.
    
    const result = await this.tareaModel.findByIdAndDelete(tareaId).exec();
    if (!result) {
      throw new NotFoundException('Tarea no encontrada');
    }
    return result;
  }

  // (RF-006) Asignar Tarea
  async assign(tareaId: string, idUsuarioAsignado: string, idUsuarioAsignador: string) {
    return this.tareaModel.findByIdAndUpdate(tareaId, {
      asignadoId: idUsuarioAsignado,
      progreso: 0,
      estado: EstadoTarea.nueva,
    }, { new: true }).exec();
  }

  // (RF-011) Actualizar Progreso
  async updateProgreso(tareaId: string, userId: string, dto: UpdateProgresoDto) {
    await this.checkIfUserIsAssigned(tareaId, userId);
    const { porcentaje } = dto;
    let nuevoEstadoTarea = EstadoTarea.nueva;

    if (porcentaje === 100) nuevoEstadoTarea = EstadoTarea.completada;
    else if (porcentaje > 0) nuevoEstadoTarea = EstadoTarea.en_progreso;

    return this.tareaModel.findByIdAndUpdate(tareaId, {
      progreso: porcentaje,
      estado: nuevoEstadoTarea,
    }, { new: true }).exec();
  }

  // (RF-012) Registrar Tiempo
  async logTiempo(tareaId: string, userId: string, dto: LogTiempoDto) {
    await this.checkIfUserIsAssigned(tareaId, userId);
    
    // $inc es el operador atómico de Mongo para incrementar
    return this.tareaModel.findByIdAndUpdate(tareaId, {
      $inc: { tiempoRegistrado: dto.minutos } 
    }, { new: true }).exec();
  }

  // (RF-020) Calificar Tarea
  async calificar(tareaId: string, idUsuarioCalificador: string, dto: CreateCalificacionDto) {
    const tarea = await this.tareaModel.findById(tareaId, 'estado').exec();
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    if (tarea.estado !== EstadoTarea.completada) {
      throw new ForbiddenException('No se puede calificar una tarea no completada');
    }

    const nuevaCalificacion = new this.calificacionModel({
      puntaje: dto.puntaje,
      nota: dto.nota,
      tareaId: tareaId,
      calificadorId: idUsuarioCalificador,
    });
    return nuevaCalificacion.save();
  }

  // (RF-010) Adjuntar Link
  async addLinkRecurso(tareaId: string, dto: CreateRecursoLinkDto) {
    const nuevoRecurso = new this.recursoModel({
      nombre: dto.nombre,
      url: dto.url,
      tipo: TipoRecurso.link,
      tareaId: tareaId,
    });
    return nuevoRecurso.save();
  }

  // (RF-010) Subir Archivo
  async addFileRecurso(tareaId: string, file: Express.Multer.File) {
    let tipo = TipoRecurso.otro;
    if (file.mimetype.startsWith('image/')) tipo = TipoRecurso.img;
    if (file.mimetype.startsWith('video/')) tipo = TipoRecurso.video;
    if (file.mimetype === 'application/pdf') tipo = TipoRecurso.pdf;
    
    const nuevoRecurso = new this.recursoModel({
      nombre: file.originalname,
      url: file.path, // Ruta donde Multer guardó el archivo
      tipo: tipo,
      tamaño: file.size,
      formato: file.mimetype,
      tareaId: tareaId,
    });
    return nuevoRecurso.save();
  }
  
  // (RF-016) Anclar Tarea
  async anclar(userId: string, tareaId: string) {
    // (Autorización)
    const anclado = new this.ancladoModel({
      idUsuario: userId,
      idTarea: tareaId,
    });
    try {
      return await anclado.save();
    } catch (error) {
      if (error.code === 11000) { // Error de duplicado en Mongo
        throw new ForbiddenException('Esta tarea ya está anclada');
      }
      throw error;
    }
  }

  // (RF-016) Desanclar Tarea
  async desanclar(userId: string, tareaId: string) {
    // (Autorización)
    const result = await this.ancladoModel.deleteOne({ 
      idUsuario: userId, 
      idTarea: tareaId 
    }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('La tarea no está anclada por este usuario');
    }
  }

  // (RF-014 / RF-015) Vincular Etiqueta
  async addEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra', user: userPayload) {
    // (Autorización)
    const nuevaRelacion = new this.etiquetaTareaModel({
      tareaId: tareaId,
      etiquetaPalabraId: tipo === 'palabra' ? etiquetaId : undefined,
      etiquetaColorId: tipo === 'color' ? etiquetaId : undefined,
    });
    try {
      return await nuevaRelacion.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ForbiddenException('La tarea ya tiene esta etiqueta');
      }
      throw new NotFoundException('Tarea o Etiqueta no encontrada');
    }
  }

  // (RF-014 / RF-015) Desvincular Etiqueta
  async removeEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra', user: userPayload) {
    // (Autorización)
    const filtro = {
      tareaId: tareaId,
      [tipo === 'color' ? 'etiquetaColorId' : 'etiquetaPalabraId']: etiquetaId,
    };
    const result = await this.etiquetaTareaModel.deleteOne(filtro).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('La tarea no tiene esta etiqueta');
    }
  }


  // --- HELPER (Adaptado a Mongoose) ---
  private async checkIfUserIsAssigned(tareaId: string, userId: string) {
    const tarea = await this.tareaModel.findById(tareaId, 'asignadoId').exec();
    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }
    if (tarea.asignadoId?.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para esta acción (no estás asignado)');
    }
  }
}