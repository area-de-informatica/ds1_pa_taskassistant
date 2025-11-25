import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Anclado {
  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuarioId: Types.ObjectId;
}

export type AncladoDocument = Anclado & Document;
export const AncladoSchema = SchemaFactory.createForClass(Anclado);
