// src/comentarios/comentarios.module.ts

import { Module } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { ComentariosController } from './comentarios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // Importante para los Guards

@Module({
  imports: [PrismaModule, AuthModule], // Realizamos la importacion los modulos de Prisma y Auth
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}