import { METADATA_KEYS } from '../constants';
import type { Type } from '../types';
import type { NestInterceptor } from '../interfaces';

export function UseInterceptors(
  ...interceptors: Array<Type<NestInterceptor> | NestInterceptor>
): ClassDecorator & MethodDecorator {
  return function (
    target: Function | Object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(
        METADATA_KEYS.INTERCEPTORS,
        interceptors,
        descriptor.value
      );
    } else {
      Reflect.defineMetadata(METADATA_KEYS.INTERCEPTORS, interceptors, target);
    }
  } as ClassDecorator & MethodDecorator;
}

export function getInterceptors(
  target: Function | Object
): Array<Type<NestInterceptor> | NestInterceptor> {
  return Reflect.getMetadata(METADATA_KEYS.INTERCEPTORS, target) || [];
}
