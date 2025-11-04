// src/auth/guards/roles.guard.ts
// Este "Guardia" lee los roles del endpoint y los compara con el rol del usuario en el JWT

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles permitidos (ej: ['administrador', 'docente_principal'])
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // Si no se definen roles, se permite el acceso
    }

    // Obtenemos el usuario que adjuntamos en jwt.strategy.ts
    const { user } = context.switchToHttp().getRequest();

    // Comparamos el rol del usuario con los roles requeridos
    return requiredRoles.some((rol) => user.rol === rol);
  }
}