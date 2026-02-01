import { METADATA_KEYS } from '../constants';
import type { Type } from '../types';
import type { ExceptionFilter } from '../interfaces';

export function UseFilters(
  ...filters: Array<Type<ExceptionFilter> | ExceptionFilter>
): ClassDecorator & MethodDecorator {
  return function (
    target: Function | Object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(METADATA_KEYS.FILTERS, filters, descriptor.value);
    } else {
      Reflect.defineMetadata(METADATA_KEYS.FILTERS, filters, target);
    }
  } as ClassDecorator & MethodDecorator;
}

export function getFilters(
  target: Function | Object
): Array<Type<ExceptionFilter> | ExceptionFilter> {
  return Reflect.getMetadata(METADATA_KEYS.FILTERS, target) || [];
}
