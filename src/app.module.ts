import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TareModule } from './tare/tare.module';
import { ComentariosModule } from './comentarios/comentarios.module';

@Module({
  imports: [AuthModule, TareModule, ComentariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
