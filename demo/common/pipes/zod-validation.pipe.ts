import { ZodSchema, ZodError } from 'zod';
import { BadRequestException } from '../../../core';
import type { PipeTransform, ArgumentMetadata } from '../../../core';

export class ZodValidationPipe<T = any> implements PipeTransform<any, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: any, metadata: ArgumentMetadata): T {
    try {
      const result = this.schema.parse(value);
      console.log(`[ZodValidationPipe] Validated ${metadata.type} successfully`);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );

        throw new BadRequestException(
          `Validation failed: ${messages.join('; ')}`
        );
      }

      throw new BadRequestException('Validation failed');
    }
  }
}
