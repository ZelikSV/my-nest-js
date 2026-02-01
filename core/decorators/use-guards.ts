import { METADATA_KEYS } from '../constants';
import type { Type } from '../types';
import type { CanActivate } from '../interfaces';

export function UseGuards(
  ...guards: Type<CanActivate>[]
): ClassDecorator & MethodDecorator {
  return function (
    target: Function | Object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(METADATA_KEYS.GUARDS, guards, descriptor.value);
    } else {
      Reflect.defineMetadata(METADATA_KEYS.GUARDS, guards, target);
    }
  } as ClassDecorator & MethodDecorator;
}

export function getGuards(target: Function | Object): Type<CanActivate>[] {
  return Reflect.getMetadata(METADATA_KEYS.GUARDS, target) || [];
}
