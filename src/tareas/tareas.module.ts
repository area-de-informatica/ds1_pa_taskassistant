import { Module } from '@nestjs/common';
import { TareasService } from './tareas.service';
import { TareasController } from './tareas.controller';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express'; // (RF-010) Para subida de archivos
import { diskStorage } from 'multer'; // (RF-010) Para configurar el almacenamiento
import { extname } from 'path'; // (RF-010) Para obtener la extensión del archivo
import { MongooseModule } from '@nestjs/mongoose';
import { Tarea, TareaSchema } from '../schemas/tarea.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Tarea.name, schema: TareaSchema }]),
    // (RF-010) Configuración de Multer para la subida de archivos
    MulterModule.register({
      dest: './uploads/recursos', // Directorio destino
      limits: {
        fileSize: 50 * 1024 * 1024, // Límite de 50MB (RF-010)
      },
      storage: diskStorage({
        // Destino
        destination: './uploads/recursos',
        // Nombre del archivo (un hash aleatorio + extensión original)
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [TareasController],
  providers: [TareasService],
})
export class TareasModule {}