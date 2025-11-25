// src/comentarios/comentarios.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario, ComentarioDocument } from '../schemas/comentario.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    // (Inyectar Modelo Mencion si RF-009 se implementa)
  ) {}

  // (RF-008) Crear Comentario
  async create(
    tareaId: string,
    idUsuarioAutor: string,
    dto: CreateComentarioDto,
  ) {
    // (Autorización: verificar que el usuario puede comentar en la tarea)
    
    const nuevoComentario = new this.comentarioModel({
  contenido: dto.contenido,
  tareaId: tareaId,
  autorId: idUsuarioAutor,
    });
    
    // (RF-009: Lógica de Menciones iría aquí,
    // probablemente en una transacción de Mongoose si es complejo)
    
    return nuevoComentario.save();
  }

  // (Otras funciones: findByTarea, update, remove...)
}