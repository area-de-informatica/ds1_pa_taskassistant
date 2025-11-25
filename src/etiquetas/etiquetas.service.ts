// src/etiquetas/etiquetas.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// --- Schemas ---
import {
  EtiquetaPalabra,
  EtiquetaPalabraDocument,
} from '../schemas/etiqueta-palabra.schema';
import {
  EtiquetaColor,
  EtiquetaColorDocument,
} from '../schemas/etiqueta-color.schema';

// --- DTOs ---
import { CreateEtiquetaPalabraDto } from './dto/create-etiqueta-palabra.dto';
import { CreateEtiquetaColorDto } from './dto/create-etiqueta-color.dto';

@Injectable()
export class EtiquetasService {
  constructor(
    @InjectModel(EtiquetaPalabra.name)
    private etiquetaPalabraModel: Model<EtiquetaPalabraDocument>,
    @InjectModel(EtiquetaColor.name)
    private etiquetaColorModel: Model<EtiquetaColorDocument>,
  ) {}

  // --- Lógica de Palabra Clave ---

  async createPalabra(dto: CreateEtiquetaPalabraDto) {
    try {
      const nuevaEtiqueta = new this.etiquetaPalabraModel({
        palabra: dto.palabra,
      });
      return await nuevaEtiqueta.save();
    } catch (error) {
      if (error.code === 11000) { // Error de duplicado (unique)
        throw new ForbiddenException('Esta etiqueta de palabra ya existe');
      }
      throw error;
    }
  }

  findAllPalabra() {
    return this.etiquetaPalabraModel.find().exec();
  }

  async removePalabra(id: string) {
    const result = await this.etiquetaPalabraModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Etiqueta de palabra no encontrada');
    }
  }

  // --- Lógica de Color ---

  async createColor(dto: CreateEtiquetaColorDto) {
    try {
      const nuevaEtiqueta = new this.etiquetaColorModel({
        color: dto.color,
      });
      return await nuevaEtiqueta.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ForbiddenException('Esta etiqueta de color ya existe');
      }
      throw error;
    }
  }

  findAllColor() {
    return this.etiquetaColorModel.find().exec();
  }

  async removeColor(id: string) { 
    const result = await this.etiquetaColorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Etiqueta de color no encontrada');
    }
  }
}