import { METADATA_KEYS } from '../constants';

export function SetMetadata<K extends string, V = any>(
  key: K,
  value: V
): ClassDecorator & MethodDecorator {
  const metadataKey = `${METADATA_KEYS.CUSTOM_METADATA}${key}`;

  return function (
    target: Function | Object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(metadataKey, value, descriptor.value);
    } else {
      Reflect.defineMetadata(metadataKey, value, target);
    }
  } as ClassDecorator & MethodDecorator;
}

export function getCustomMetadata<T = any>(
  key: string,
  target: Function | Object
): T | undefined {
  const metadataKey = `${METADATA_KEYS.CUSTOM_METADATA}${key}`;
  return Reflect.getMetadata(metadataKey, target);
}
