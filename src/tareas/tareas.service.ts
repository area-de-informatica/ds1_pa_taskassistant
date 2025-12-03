// src/tareas/tareas.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Schemas
import { Tarea, TareaDocument } from '../schemas/tarea.schema';
import { Calificacion, CalificacionDocument } from '../schemas/calificacion.schema';
import { Recurso, RecursoDocument } from '../schemas/recurso.schema';
import { Anclado, AncladoDocument } from '../schemas/anclado.schema';
import { EtiquetaTarea, EtiquetaTareaDocument } from '../schemas/etiqueta-tarea.schema';

// DTOs
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';
import { LogTiempoDto } from './dto/log-tiempo.dto';
import { CreateCalificacionDto } from './dto/create-calificacion.dto';
import { CreateRecursoLinkDto } from './dto/create-recurso-link.dto';

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
      asignadoId: dto.asignadoId || null,
      requiereArchivo: dto.requiereArchivo || false,
      fechaVencimiento: dto.fechaEntrega ? new Date(dto.fechaEntrega) : null,
    });
    return nuevaTarea.save();
  }

  // (RF-001) Leer Tareas
  async findAll(user: userPayload) {
    const filtro: any = {};
    if (user.rol !== 'administrador') {
      filtro.$or = [
        { creadorId: user.userId },
        { asignadoId: user.userId }
      ];
    }

    return this.tareaModel.find(filtro)
      .populate('asignadoId', 'id nombre email')
      .populate('creadorId', 'id nombre email')
      .sort({ createdAt: -1 })
      .exec();
  }

  // (RF-001) Leer una Tarea (CORREGIDO Y ROBUSTO)
  async findOne(tareaId: string, user: userPayload) {
    // 1. Buscar la tarea SOLO por ID
    const tarea = await this.tareaModel.findById(tareaId)
      .populate('comentarios')
      // Ahora estos populate funcionarán gracias al cambio en el Schema
      .populate({ path: 'etiquetas', populate: ['etiquetaColor', 'etiquetaPalabra']})
      .populate({ path: 'metas', populate: 'meta' })
      .populate('asignadoId', 'id nombre email')
      .populate('creadorId', 'id nombre email')
      .populate({
        path: 'calificaciones',
        populate: { path: 'calificador', select: 'id nombre' },
      })
      .populate('recursos')
      .exec();

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // 2. Verificación de Permisos Manual (Segura con Strings)
    if (user.rol !== 'administrador') {
      // Extraemos los IDs como strings seguros para evitar errores de tipo
      const creadorIdStr = (tarea.creadorId as any)?._id?.toString() || tarea.creadorId?.toString();
      const asignadoIdStr = (tarea.asignadoId as any)?._id?.toString() || tarea.asignadoId?.toString();
      
      // Si no coincide con ninguno, bloqueamos
      if (creadorIdStr !== user.userId && asignadoIdStr !== user.userId) {
        throw new ForbiddenException('No tienes permiso para ver esta tarea');
      }
    }
    
    return tarea;
  }

  // (RF-005) Actualizar Tarea
  async update(tareaId: string, dto: UpdateTareaDto, user: userPayload) {
    return this.tareaModel.findByIdAndUpdate(tareaId, {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        estado: dto.estado,
        prioridad: dto.prioridad,
        fechaVencimiento: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
    }, { new: true }).exec();
  }

  // (RF-001) Borrar Tarea
  async remove(tareaId: string, user: userPayload) {
    const result = await this.tareaModel.findByIdAndDelete(tareaId).exec();
    if (!result) throw new NotFoundException('Tarea no encontrada');
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
      url: file.path,
      tipo: tipo,
      tamaño: file.size,
      formato: file.mimetype,
      tareaId: tareaId,
    });
    return nuevoRecurso.save();
  }
  
  // (RF-016) Anclar Tarea
  async anclar(userId: string, tareaId: string) {
    const anclado = new this.ancladoModel({ idUsuario: userId, idTarea: tareaId });
    try { return await anclado.save(); }
    catch (error) { if (error.code === 11000) throw new ForbiddenException('Ya anclada'); throw error; }
  }

  // (RF-016) Desanclar Tarea
  async desanclar(userId: string, tareaId: string) {
    const result = await this.ancladoModel.deleteOne({ idUsuario: userId, idTarea: tareaId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('No anclada');
  }

  // (RF-014 / RF-015) Etiquetas
  async addEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra', user: userPayload) {
    const nuevaRelacion = new this.etiquetaTareaModel({
      tareaId: tareaId,
      etiquetaPalabraId: tipo === 'palabra' ? etiquetaId : undefined,
      etiquetaColorId: tipo === 'color' ? etiquetaId : undefined,
    });
    try { return await nuevaRelacion.save(); }
    catch (error) { if (error.code === 11000) throw new ForbiddenException('Ya etiquetada'); throw new NotFoundException('Error'); }
  }

  async removeEtiqueta(tareaId: string, etiquetaId: string, tipo: 'color' | 'palabra', user: userPayload) {
    const filtro = {
      tareaId: tareaId,
      [tipo === 'color' ? 'etiquetaColorId' : 'etiquetaPalabraId']: etiquetaId,
    };
    const result = await this.etiquetaTareaModel.deleteOne(filtro).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Etiqueta no encontrada en tarea');
  }

  // --- HELPER ---
  private async checkIfUserIsAssigned(tareaId: string, userId: string) {
    const tarea = await this.tareaModel.findById(tareaId, 'asignadoId').exec();
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    if (tarea.asignadoId?.toString() !== userId) throw new ForbiddenException('No estás asignado');
  }
}