import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EtiquetaTarea {
  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Etiqueta', required: true })
  etiquetaId: Types.ObjectId;

  @Prop({ required: true })
  tipo: string; // 'color' | 'palabra'
}

export type EtiquetaTareaDocument = EtiquetaTarea & Document;
export const EtiquetaTareaSchema = SchemaFactory.createForClass(EtiquetaTarea);
