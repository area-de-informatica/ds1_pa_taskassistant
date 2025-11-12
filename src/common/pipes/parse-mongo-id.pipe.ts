import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException('Invalid Mongo id');
    }
    return value;
  }
}
