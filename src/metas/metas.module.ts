// src/metas/metas.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { Meta, MetaSchema } from '../schemas/meta.schema';
import { MetaTarea, MetaTareaSchema } from '../schemas/meta-tarea.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Meta.name, schema: MetaSchema },
      { name: MetaTarea.name, schema: MetaTareaSchema },
    ]),
  ],
  controllers: [MetasController],
  providers: [MetasService],
})
export class MetasModule {}