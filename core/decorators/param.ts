import { METADATA_KEYS } from '../constants';
import { ArgumentMetadata, ParamType, Type } from '../types';

function createParamDecorator(type: ParamType) {
  return function (
    dataOrPipe?: string | Type | object,
    ...pipes: Array<Type | object>
  ): ParameterDecorator {
    return function (
      target: Object,
      propertyKey: string | symbol | undefined,
      parameterIndex: number
    ) {
      if (!propertyKey) return;

      let data: string | undefined;
      let paramPipes: Array<Type | object> = [];

      if (typeof dataOrPipe === 'string') {
        data = dataOrPipe;
        paramPipes = pipes;
      } else if (dataOrPipe) {
        paramPipes = [dataOrPipe, ...pipes];
      }

      const paramTypes: Type[] =
        Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
      const metatype = paramTypes[parameterIndex];

      const params: ArgumentMetadata[] =
        Reflect.getMetadata(METADATA_KEYS.PARAMS, target.constructor) || [];

      params.push({
        index: parameterIndex,
        type,
        metatype,
        data,
        methodName: String(propertyKey),
        pipes: paramPipes.length > 0 ? paramPipes : undefined,
      });

      Reflect.defineMetadata(METADATA_KEYS.PARAMS, params, target.constructor);
    };
  };
}

export const Param = createParamDecorator('param');
export const Query = createParamDecorator('query');
export const Body = createParamDecorator('body');
export const Headers = createParamDecorator('headers');

export function getParamMetadata(controller: Function): ArgumentMetadata[] {
  return Reflect.getMetadata(METADATA_KEYS.PARAMS, controller) || [];
}

export function getMethodParamMetadata(
  controller: Function,
  methodName: string
): ArgumentMetadata[] {
  const allParams = getParamMetadata(controller);
  return allParams
    .filter((p) => p.methodName === methodName)
    .sort((a, b) => a.index - b.index);
}
