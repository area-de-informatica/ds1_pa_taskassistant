import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Calificacion {
  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuarioId: Types.ObjectId;

  @Prop({ required: true })
  valor: number;

  @Prop()
  comentario?: string;
}

export type CalificacionDocument = Calificacion & Document;
export const CalificacionSchema = SchemaFactory.createForClass(Calificacion);
