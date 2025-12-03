// src/app.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // <-- Importar Mongoose
import { ConfigModule } from '@nestjs/config'; // <-- Para .env

// Nuestros módulos de funcionalidades
import { AuthModule } from './auth/auth.module';
import { TareasModule } from './tareas/tareas.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { MetasModule } from './metas/metas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
// (No necesitamos un PrismaModule)

@Module({
  imports: [
    // 1. Cargar variables de entorno (para DATABASE_URL)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Conectar Mongoose a la BD
  MongooseModule.forRoot(process.env.DATABASE_URL ?? ''), // <-- Conexión principal

    // 3. Importar nuestros módulos de funcionalidades
    AuthModule,
    TareasModule,
    ComentariosModule,
    MetasModule,
    UsuariosModule,
    EtiquetasModule
    // (Asegúrate de importar EtiquetasModule si lo creaste)
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}