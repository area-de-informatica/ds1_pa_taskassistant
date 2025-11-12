import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Recurso {
  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;

  @Prop({ required: true })
  tipo: string; // 'link' | 'archivo'

  @Prop()
  url?: string;

  @Prop()
  filename?: string;
}

export type RecursoDocument = Recurso & Document;
export const RecursoSchema = SchemaFactory.createForClass(Recurso);
