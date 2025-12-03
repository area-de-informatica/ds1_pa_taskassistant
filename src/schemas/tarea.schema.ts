// src/schemas/tarea.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from './usuario.schema';

export type TareaDocument = HydratedDocument<Tarea>;

@Schema({ 
  timestamps: true,
  // IMPORTANTE: Estas líneas permiten que los campos virtuales (populates) funcionen
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
})
export class Tarea {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion: string;

  @Prop({ default: 'pendiente' })
  estado: string;

  @Prop({ default: 'media' })
  prioridad: string;

  @Prop({ default: 0 })
  progreso: number;

  @Prop({ default: 0 })
  tiempoRegistrado: number;

  @Prop({ default: false })
  requiereArchivo: boolean;

  @Prop()
  fechaVencimiento: Date;

  // --- REFERENCIAS A USUARIOS ---
  @Prop({ type: Types.ObjectId, ref: 'Usuario' })
  creadorId: Usuario; 

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: false })
  asignadoId: Usuario; 
}

export const TareaSchema = SchemaFactory.createForClass(Tarea);

// ======================================================
// 🔗 RELACIONES VIRTUALES (Solución al StrictPopulateError)
// ======================================================

// 1. Relación con Comentarios
TareaSchema.virtual('comentarios', {
  ref: 'Comentario',      // Debe coincidir con el nombre en ComentarioSchema
  localField: '_id',
  foreignField: 'tareaId'
});

// 2. Relación con Etiquetas (EtiquetaTarea)
TareaSchema.virtual('etiquetas', {
  ref: 'EtiquetaTarea',   // Debe coincidir con el nombre en EtiquetaTareaSchema
  localField: '_id',
  foreignField: 'tareaId'
});

// 3. Relación con Metas (MetaTarea)
TareaSchema.virtual('metas', {
  ref: 'MetaTarea',       // Debe coincidir con el nombre en MetaTareaSchema
  localField: '_id',
  foreignField: 'tareaId'
});

// 4. Relación con Calificaciones
TareaSchema.virtual('calificaciones', {
  ref: 'Calificacion',    // Debe coincidir con el nombre en CalificacionSchema
  localField: '_id',
  foreignField: 'tareaId'
});

// 5. Relación con Recursos
TareaSchema.virtual('recursos', {
  ref: 'Recurso',         // Debe coincidir con el nombre en RecursoSchema
  localField: '_id',
  foreignField: 'tareaId'
});