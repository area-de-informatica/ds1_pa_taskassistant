// src/usuarios/usuarios.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // Importar bcrypt

import { Usuario, UsuarioDocument } from '../schemas/usuario.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // 1. Verificar si el email ya existe
    const existe = await this.usuarioModel.findOne({ email: createUsuarioDto.email });
    if (existe) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // 3. Crear el usuario
    const nuevoUsuario = new this.usuarioModel({
      ...createUsuarioDto,
      password: hashedPassword, // Guardamos la versión encriptada
    });

    // 4. Guardar y devolver sin la contraseña
    const usuarioGuardado = await nuevoUsuario.save();
    const { password, ...result } = usuarioGuardado.toObject();
    return result;
  }

  async findAll() {
    // Devolvemos todos los usuarios MENOS el campo password
    return this.usuarioModel.find().select('-password').exec();
  }

  async findOne(id: string) {
    const usuario = await this.usuarioModel.findById(id).select('-password').exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const datosActualizar = { ...updateUsuarioDto };

    // Si viene una nueva contraseña, hay que hashearla
    if (datosActualizar.password) {
      datosActualizar.password = await bcrypt.hash(datosActualizar.password, 10);
    }

    const usuarioActualizado = await this.usuarioModel
      .findByIdAndUpdate(id, datosActualizar, { new: true }) // new: true devuelve el obj actualizado
      .select('-password')
      .exec();

    if (!usuarioActualizado) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuarioActualizado;
  }

  async remove(id: string) {
    const eliminado = await this.usuarioModel.findByIdAndDelete(id).exec();
    if (!eliminado) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return eliminado;
  }
}