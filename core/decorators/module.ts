import { METADATA_KEYS } from '../constants';
import { ModuleMetadata, DynamicModule, Type } from '../types';

export type { DynamicModule };

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(METADATA_KEYS.MODULE, metadata, target);
  };
}

export function getModuleMetadata(target: Type): ModuleMetadata | undefined {
  return Reflect.getOwnMetadata(METADATA_KEYS.MODULE, target);
}

export function isModule(target: any) {
  return Reflect.hasMetadata(METADATA_KEYS.MODULE, target);
}

export function isDynamicModule(module: any): module is DynamicModule {
  return module && typeof module === 'object' && 'module' in module;
}
