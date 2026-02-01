import { METADATA_KEYS } from '../constants';

export function Controller(path: string = ''): ClassDecorator {
  return function (constructor: Function) {
    const normalizedPath = path
      ? '/' + path.replace(/^\/+|\/+$/g, '')
      : '';

    Reflect.defineMetadata(METADATA_KEYS.CONTROLLER_PATH, normalizedPath, constructor);
  };
}

export function getControllerPath(constructor: Function) {
  return Reflect.getOwnMetadata(METADATA_KEYS.CONTROLLER_PATH, constructor) ?? '';
}

export function isController(constructor: Function) {
  return Reflect.hasMetadata(METADATA_KEYS.CONTROLLER_PATH, constructor);
}
