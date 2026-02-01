import { METADATA_KEYS } from '../constants';
import { RouteMetadata } from '../types';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

function createRouteDecorator(method: HttpMethod) {
  return function (path: string = ''): MethodDecorator {
    return function (
      target: Object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const routes: RouteMetadata[] =
        Reflect.getMetadata(METADATA_KEYS.ROUTES, target.constructor) || [];

      const normalizedPath = path ? '/' + path.replace(/^\/+|\/+$/g, '') : '';

      routes.push({
        method,
        path: normalizedPath,
        handlerName: String(propertyKey),
      });

      Reflect.defineMetadata(METADATA_KEYS.ROUTES, routes, target.constructor);

      return descriptor;
    };
  };
}

export const Get = createRouteDecorator('get');

export const Post = createRouteDecorator('post');

export const Put = createRouteDecorator('put');

export const Patch = createRouteDecorator('patch');

export const Delete = createRouteDecorator('delete');

export function getRoutes(controller: Function): RouteMetadata[] {
  return Reflect.getMetadata(METADATA_KEYS.ROUTES, controller) || [];
}
