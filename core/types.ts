export interface Type<T = any> extends Function {
  new (...args: any[]): T;
}

export type ParamType = 'body' | 'query' | 'param' | 'headers' | 'cookies';

export interface ArgumentMetadata {
  readonly index: number;
  readonly type: ParamType;
  readonly metatype?: Type;
  readonly data?: string;
  readonly methodName: string;
  readonly pipes?: Array<Type | object>;
}

export interface RouteMetadata {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  handlerName: string;
}

export interface DynamicModule extends ModuleMetadata {
  module: Type;
  global?: boolean;
}

export interface ModuleMetadata {
  imports?: Array<Type | DynamicModule>;
  controllers?: Type[];
  providers?: Array<Type | Provider>;
  exports?: Array<Type | string | symbol>;
}

export interface ClassProvider {
  provide: Type | string | symbol;
  useClass: Type;
}

export interface ValueProvider {
  provide: Type | string | symbol;
  useValue: any;
}

export interface FactoryProvider {
  provide: Type | string | symbol;
  useFactory: (...args: any[]) => any | Promise<any>;
  inject?: Array<Type | string | symbol>;
}

export type Provider = ClassProvider | ValueProvider | FactoryProvider | Type;

export function isClassProvider(provider: Provider): provider is ClassProvider {
  return typeof provider === 'object' && 'useClass' in provider;
}

export function isValueProvider(provider: Provider): provider is ValueProvider {
  return typeof provider === 'object' && 'useValue' in provider;
}

export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return typeof provider === 'object' && 'useFactory' in provider;
}
