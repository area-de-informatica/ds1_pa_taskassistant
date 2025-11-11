// src/comentarios/comentarios.module.ts

import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { AuthModule } from '../auth/auth.module'; // Importante para los Guards
import { MongooseModule } from '@nestjs/mongoose';
import { Comentario, ComentarioSchema } from '../schemas/comentario.schema';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: Comentario.name, schema: ComentarioSchema }])], // Realizamos la importacion los modulos de Auth y Mongoose
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}