// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- Importar Swagger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // (Opcional) Habilitar CORS
  app.enableCors();

  // (Recomendado) Pipa de Validación Global para DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si se envían propiedades no definidas
    }),
  );

  // --- INICIO DE CONFIGURACIÓN DE SWAGGER ---

  const config = new DocumentBuilder()
    .setTitle('Task Assistant API')
    .setDescription(
      'Documentación interactiva de la API para Task Assistant (MongoDB)',
    )
    .setVersion('1.0')
    .addTag('Tareas', 'Gestión del ciclo de vida de las tareas')
    .addTag('Auth', 'Autenticación y generación de tokens')
    .addTag('Metas', 'Gestión de metas y vinculación de tareas')
    .addTag('Etiquetas', 'Gestión de la lista maestra de etiquetas')
    .addTag('Comentarios', 'Gestión de comentarios en tareas')
    .addBearerAuth() // <-- IMPORTANTE: Para el candado de JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // La ruta para ver la documentación (ej: http://localhost:3000/api-docs)
  SwaggerModule.setup('api-docs', app, document); 

  // --- FIN DE SWAGGER ---

  await app.listen(process.env.PORT || 3000);
}
bootstrap();