import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from './usuario.schema';

@Schema({ timestamps: true })
export class Tarea extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: 'pendiente' })
  estado: string;

  @Prop({ default: 'media' })
  prioridad: string;

  // referencia a un solo usuario (1:N)
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: false })
  asignadoId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  creadorId: Types.ObjectId;

  @Prop({ default: 0 })
  progreso: number;

  @Prop({ default: 0 })
  tiempoRegistrado: number; // en minutos

  @Prop({ required: false })
  fechaVencimiento?: Date;
}

export const TareaSchema = SchemaFactory.createForClass(Tarea);
