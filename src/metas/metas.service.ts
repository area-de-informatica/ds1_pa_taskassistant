// src/metas/metas.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from '../schemas/meta.schema';
import { MetaTarea, MetaTareaDocument } from '../schemas/meta-tarea.schema';
import { CreateMetaDto } from './dto/create-meta.dto';

@Injectable()
export class MetasService {
  constructor(
    @InjectModel(Meta.name) private metaModel: Model<MetaDocument>,
    @InjectModel(MetaTarea.name) private metaTareaModel: Model<MetaTareaDocument>,
  ) {}

  // (CRUD de Metas)
  create(dto: CreateMetaDto) {
    const nuevaMeta = new this.metaModel(dto);
    return nuevaMeta.save();
  }

  findAll() {
    return this.metaModel.find().populate({
      path: 'tareas', // Nombre del campo en meta.schema.ts
      populate: { path: 'tarea', select: 'id titulo estado' }
    }).exec();
  }

  async remove(id: string) {
    // Borrar también las vinculaciones
    await this.metaTareaModel.deleteMany({ metaId: id }).exec();
    const result = await this.metaModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Meta no encontrada');
    }
    return result;
  }

  // (Vinculación de Tareas)
  async vincularTarea(metaId: string, tareaId: string) {
    const nuevaVinculacion = new this.metaTareaModel({
      metaId: metaId,
      tareaId: tareaId,
    });
    try {
      return await nuevaVinculacion.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ForbiddenException('La tarea ya está vinculada a esta meta');
      }
      throw new NotFoundException('Meta o Tarea no encontrada');
    }
  }

  async desvincularTarea(metaId: string, tareaId: string) {
    const result = await this.metaTareaModel.deleteOne({ 
      metaId: metaId, 
      tareaId: tareaId 
    }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Vinculación no encontrada');
    }
  }
}