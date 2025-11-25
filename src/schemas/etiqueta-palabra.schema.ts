import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EtiquetaPalabra {
  @Prop({ required: true, unique: true })
  palabra: string;
}

export type EtiquetaPalabraDocument = EtiquetaPalabra & Document;
export const EtiquetaPalabraSchema = SchemaFactory.createForClass(EtiquetaPalabra);
