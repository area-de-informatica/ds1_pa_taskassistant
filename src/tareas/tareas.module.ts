// src/tareas/tareas.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TareasService } from './tareas.service';
import { TareasController } from './tareas.controller';

// Importar todos los schemas que usaremos
import { Tarea, TareaSchema } from '../schemas/tarea.schema';
import { Calificacion, CalificacionSchema } from '../schemas/calificacion.schema';
import { Recurso, RecursoSchema } from '../schemas/recurso.schema';
import { EtiquetaTarea, EtiquetaTareaSchema } from '../schemas/etiqueta-tarea.schema';
import { Anclado, AncladoSchema } from '../schemas/anclado.schema';

// Importar AuthModule (para los Guards) y MulterModule (para archivos)
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    AuthModule, // Para JwtAuthGuard y RolesGuard

    // Inyectar los modelos de Mongoose en este módulo
    MongooseModule.forFeature([
      { name: Tarea.name, schema: TareaSchema },
      { name: Calificacion.name, schema: CalificacionSchema },
      { name: Recurso.name, schema: RecursoSchema },
      { name: EtiquetaTarea.name, schema: EtiquetaTareaSchema },
      { name: Anclado.name, schema: AncladoSchema },
    ]),

    // (RF-010) Configuración de Multer
    MulterModule.register({
      dest: './uploads',
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}