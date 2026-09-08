import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          statusCode: 400,
          error: 'Validation Error',
          issues: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
            code: i.code
          }))
        });
      }
      throw new BadRequestException('Invalid payload');
    }
  }
}
