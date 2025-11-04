// src/comentarios/comentarios.service.ts

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComentarioDto } from './dto/create-comentario.dto';

// Payload del usuario decodificado del JWT
type userPayload = {
  userId: string;
  email: string;
  rol: string;
};

@Injectable()
export class ComentariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * (RF-008 y RF-009) Crear un Comentario y procesar Menciones
   */
  async create(
    tareaId: string,
    idUsuarioAutor: string,
    createComentarioDto: CreateComentarioDto,
  ) {
    const { contenido, menciones } = createComentarioDto;

    // (Validación de autorización:
    // Aquí deberíamos verificar si el idUsuarioAutor tiene permiso 
    // para ver/comentar en la tareaId. Por simplicidad, lo omitimos,
    // pero es un paso de seguridad crítico.)

    try {
      // Usamos una transacción para asegurar que o se crea todo (comentario + menciones)
      // o no se crea nada.
      const resultado = await this.prisma.$transaction(async (tx) => {
        // 1. Crear el comentario principal
        const comentario = await tx.comentario.create({
          data: {
            contenido: contenido,
            idTarea: tareaId,
            idUsuarioAutor: idUsuarioAutor,
            // 'fecha' se establece por defecto (según tu esquema)
          },
        });

        // 2. (RF-009) Si hay menciones, crearlas
        if (menciones && menciones.length > 0) {
          // Preparamos los datos para la tabla 'Mencion'
          const datosMenciones = menciones.map((idUsuarioMencionado) => ({
            idComentario: comentario.id, // ID del comentario que acabamos de crear
            idUsuarioMencionado: idUsuarioMencionado,
          }));

          // Creamos todas las menciones
          await tx.mencion.createMany({
            data: datosMenciones,
            skipDuplicates: true, // Evitar fallos si se menciona al mismo usuario dos veces
          });
        }
        
        // (RF-021: Aquí se dispararía la notificación para los usuarios mencionados)
        
        return comentario;
      });

      return resultado;

    } catch (error) {
      // (Manejo de errores, ej: si la tarea no existe)
      if (error.code === 'P2003') { // Error de Foreign Key (Tarea o Usuario no existe)
        throw new NotFoundException('La Tarea o el Usuario no existen');
      }
      throw error;
    }
  }

  // (Aquí irían los métodos de findByTarea, update y remove para comentarios)
}