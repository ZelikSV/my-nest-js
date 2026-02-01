import { METADATA_KEYS } from '../constants';
import type { Type } from '../types';
import type { PipeTransform } from '../interfaces';

export function UsePipes(
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ClassDecorator & MethodDecorator {
  return function (
    target: Function | Object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(METADATA_KEYS.PIPES, pipes, descriptor.value);
    } else {
      Reflect.defineMetadata(METADATA_KEYS.PIPES, pipes, target);
    }
  } as ClassDecorator & MethodDecorator;
}

export function getPipes(
  target: Function | Object
): Array<Type<PipeTransform> | PipeTransform> {
  return Reflect.getMetadata(METADATA_KEYS.PIPES, target) || [];
}
