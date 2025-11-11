import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ required: true })
  contenido: string;

  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autorId: Types.ObjectId;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
