import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TareasModule } from './tareas/tareas.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { MetasModule } from './metas/metas.module';

@Module({
  imports: [AuthModule, TareasModule, ComentariosModule, EtiquetasModule, MetasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
