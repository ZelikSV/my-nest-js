import { BadRequestException } from '../../../core';
import type { ArgumentMetadata, PipeTransform } from '../../../core';

export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      const paramInfo = metadata.data ? ` "${metadata.data}"` : '';
      throw new BadRequestException(
        `Validation failed: ${metadata.type}${paramInfo} must be an integer`
      );
    }

    console.log(`[ParseIntPipe] Transformed "${value}" -> ${parsed}`);
    return parsed;
  }
}
