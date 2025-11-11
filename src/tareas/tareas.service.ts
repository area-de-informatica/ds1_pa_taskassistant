import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Tarea } from "../schemas/tarea.schema";
import { Usuario } from "../schemas/usuario.schema";

import { CreateTareaDto } from "./dto/create-tarea.dto";
import { UpdateTareaDto } from "./dto/update-tarea.dto";
import { UpdateProgresoDto } from "./dto/update-progreso.dto";
import { LogTiempoDto } from "./dto/log-tiempo.dto";
import { CreateCalificacionDto } from "./dto/create-calificacion.dto";
import { CreateRecursoLinkDto } from "./dto/create-recurso-link.dto";
import { LinkEtiquetaDto } from "./dto/link-etiqueta.dto";

enum EstadoTarea {
  nueva = "pendiente",
  en_progreso = "en_progreso",
  completada = "completada",
  archivada = "archivada",
}

type RolUsuario = "administrador" | "docente_principal" | "docente_invitado" | "estudiante";

type userPayload = {
  userId: string;
  email: string;
  rol: RolUsuario;
};

@Injectable()
export class TareasService {
  constructor(
    @InjectModel(Tarea.name) private tareaModel: Model<Tarea>,
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  async create(
    proyectoId: string,
    idUsuarioCreador: string,
    createTareaDto: CreateTareaDto,
  ) {
    const creadorId = new Types.ObjectId(idUsuarioCreador);
    
    const tarea = new this.tareaModel({
      titulo: createTareaDto.titulo,
      descripcion: createTareaDto.descripcion || "",
      estado: EstadoTarea.nueva,
      prioridad: createTareaDto.prioridad || "media",
      creadorId,
      asignadoId: null,
      fechaVencimiento: createTareaDto.fechaEntrega
        ? new Date(createTareaDto.fechaEntrega)
        : null,
      progreso: 0,
      tiempoRegistrado: 0,
    });

    return tarea.save();
  }

  async findAll(proyectoId: string, user: userPayload) {
    const userId = new Types.ObjectId(user.userId);
    
    return this.tareaModel.find({
      $or: [{ creadorId: userId }, { asignadoId: userId }],
    }).sort({ createdAt: -1 });
  }

  async findOne(tareaId: string, user: userPayload) {
    const id = new Types.ObjectId(tareaId);
    
    const tarea = await this.tareaModel.findById(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    const userId = new Types.ObjectId(user.userId);
    if (
      !tarea.creadorId.equals(userId) &&
      !tarea.asignadoId?.equals(userId) &&
      user.rol !== "administrador"
    ) {
      throw new ForbiddenException(
        "No tienes permiso para ver esta tarea"
      );
    }

    return tarea;
  }

  async update(
    tareaId: string,
    user: userPayload,
    updateTareaDto: UpdateTareaDto,
  ) {
    const id = new Types.ObjectId(tareaId);
    const tarea = await this.tareaModel.findById(id);

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    const userId = new Types.ObjectId(user.userId);
    if (!tarea.creadorId.equals(userId) && user.rol !== "administrador") {
      throw new ForbiddenException(
        "Solo el creador puede actualizar la tarea"
      );
    }

    if (updateTareaDto.titulo) tarea.titulo = updateTareaDto.titulo;
    if (updateTareaDto.descripcion) tarea.descripcion = updateTareaDto.descripcion;
    if (updateTareaDto.estado) tarea.estado = updateTareaDto.estado;
    if (updateTareaDto.prioridad) tarea.prioridad = updateTareaDto.prioridad;
    if (updateTareaDto.fechaEntrega)
      tarea.fechaVencimiento = new Date(updateTareaDto.fechaEntrega);

    return tarea.save();
  }

  async remove(tareaId: string, user: userPayload) {
    const id = new Types.ObjectId(tareaId);
    const tarea = await this.tareaModel.findById(id);

    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    const userId = new Types.ObjectId(user.userId);
    if (!tarea.creadorId.equals(userId) && user.rol !== "administrador") {
      throw new ForbiddenException(
        "Solo el creador puede eliminar la tarea"
      );
    }

    return this.tareaModel.findByIdAndDelete(id);
  }

  async assignTarea(tareaId: string, usuarioId: string, user: userPayload) {
    const id = new Types.ObjectId(tareaId);
    const asignadoId = new Types.ObjectId(usuarioId);

    const tarea = await this.tareaModel.findById(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    tarea.asignadoId = asignadoId;
    return tarea.save();
  }

  async updateProgreso(
    tareaId: string,
    user: userPayload,
    updateProgresoDto: UpdateProgresoDto,
  ) {
    const id = new Types.ObjectId(tareaId);
    const userId = new Types.ObjectId(user.userId);

    const tarea = await this.tareaModel.findById(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    if (
      !tarea.creadorId.equals(userId) &&
      !tarea.asignadoId?.equals(userId) &&
      user.rol !== "administrador"
    ) {
      throw new ForbiddenException(
        "No tienes permiso para actualizar el progreso"
      );
    }

    tarea.progreso = Math.min(100, Math.max(0, updateProgresoDto.porcentaje));
    if (tarea.progreso === 100) {
      tarea.estado = EstadoTarea.completada;
    } else if (tarea.progreso > 0) {
      tarea.estado = EstadoTarea.en_progreso;
    }

    return tarea.save();
  }

  async logTiempo(
    tareaId: string,
    user: userPayload,
    logTiempoDto: LogTiempoDto,
  ) {
    const id = new Types.ObjectId(tareaId);
    const userId = new Types.ObjectId(user.userId);

    const tarea = await this.tareaModel.findById(id);
    if (!tarea) {
      throw new NotFoundException(`Tarea con ID ${tareaId} no encontrada`);
    }

    if (
      !tarea.creadorId.equals(userId) &&
      !tarea.asignadoId?.equals(userId) &&
      user.rol !== "administrador"
    ) {
      throw new ForbiddenException(
        "No tienes permiso para registrar tiempo"
      );
    }

    tarea.tiempoRegistrado += logTiempoDto.minutos || 0;

    return tarea.save();
  }

  async findByIdTarea(tareaId: string) {
    const id = new Types.ObjectId(tareaId);
    return this.tareaModel.findById(id);
  }

  async getAllTareas() {
    return this.tareaModel.find().sort({ createdAt: -1 });
  }

  async getTareasAsignadas(usuarioId: string) {
    const userId = new Types.ObjectId(usuarioId);
    return this.tareaModel.find({ asignadoId: userId }).sort({ createdAt: -1 });
  }

  async getTareasCreadas(usuarioId: string) {
    const userId = new Types.ObjectId(usuarioId);
    return this.tareaModel.find({ creadorId: userId }).sort({ createdAt: -1 });
  }

  async createCalificacion(tareaId: string, user: userPayload, createCalificacionDto: CreateCalificacionDto) {
    throw new Error("createCalificacion no implementado aún");
  }

  async createRecursoLink(tareaId: string, user: userPayload, createRecursoLinkDto: CreateRecursoLinkDto) {
    throw new Error("createRecursoLink no implementado aún");
  }

  async linkEtiqueta(tareaId: string, user: userPayload, linkEtiquetaDto: LinkEtiquetaDto) {
    throw new Error("linkEtiqueta no implementado aún");
  }
}
