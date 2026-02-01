import { METADATA_KEYS } from '../constants';
import { container } from '../container';

export function Injectable(): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);

    container.register(target as any);
  };
}

export function isInjectable(target: Function): boolean {
  return Reflect.getOwnMetadata(METADATA_KEYS.INJECTABLE, target) === true;
}
