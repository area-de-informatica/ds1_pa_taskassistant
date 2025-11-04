// src/auth/decorators/roles.decorator.ts
// Este es un "decorador" para asignar roles a un endpoint

import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '@prisma/client'; // Importa tu Enum de Prisma

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);