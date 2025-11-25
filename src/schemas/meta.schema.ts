import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Meta {
  @Prop({ required: true })
  titulo: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Tarea', default: [] })
  tareas: Types.ObjectId[];
}

export type MetaDocument = Meta & Document;
export const MetaSchema = SchemaFactory.createForClass(Meta);
