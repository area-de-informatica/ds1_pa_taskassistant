import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MetaTarea {
  @Prop({ type: Types.ObjectId, ref: 'Meta', required: true })
  metaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tarea', required: true })
  tareaId: Types.ObjectId;
}

export type MetaTareaDocument = MetaTarea & Document;
export const MetaTareaSchema = SchemaFactory.createForClass(MetaTarea);
