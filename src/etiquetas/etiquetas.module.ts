// src/etiquetas/etiquetas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EtiquetasService } from './etiquetas.service';
import { EtiquetasController } from './etiquetas.controller';
import { AuthModule } from '../auth/auth.module';

// Importar los schemas de Mongoose
import {
  EtiquetaPalabra,
  EtiquetaPalabraSchema,
} from '../schemas/etiqueta-palabra.schema';
import {
  EtiquetaColor,
  EtiquetaColorSchema,
} from '../schemas/etiqueta-color.schema';

@Module({
  imports: [
    AuthModule, // Para los Guards (JwtAuthGuard, RolesGuard)
    MongooseModule.forFeature([
      { name: EtiquetaPalabra.name, schema: EtiquetaPalabraSchema },
      { name: EtiquetaColor.name, schema: EtiquetaColorSchema },
    ]),
  ],
  controllers: [EtiquetasController],
  providers: [EtiquetasService],
})
export class EtiquetasModule {}