import { PartialType } from '@nestjs/swagger'; // PartialType hace todos los campos opcionales
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}