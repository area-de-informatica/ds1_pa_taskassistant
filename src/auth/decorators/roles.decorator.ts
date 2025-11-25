// src/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

type RolUsuario = 'administrador' | 'docente_principal' | 'docente_invitado' | 'estudiante';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);