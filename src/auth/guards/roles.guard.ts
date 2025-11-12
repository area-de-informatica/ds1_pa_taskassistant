// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // (Crearemos este decorador ahora)

type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos desde el decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no tiene un decorador @Roles(), permite el acceso
    // (porque JwtAuthGuard ya verificó que el usuario está logueado)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Obtener el usuario que nuestro JwtStrategy adjuntó
    const { user } = context.switchToHttp().getRequest();

    // 3. Comparar el rol del usuario con los roles requeridos
    return requiredRoles.some((rol) => user.rol === rol);
  }
}