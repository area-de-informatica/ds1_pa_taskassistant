import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EtiquetaColor {
  @Prop({ required: true, unique: true })
  color: string;
}

export type EtiquetaColorDocument = EtiquetaColor & Document;
export const EtiquetaColorSchema = SchemaFactory.createForClass(EtiquetaColor);
