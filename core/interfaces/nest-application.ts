import type { Type } from '../types';
import type { CanActivate } from './can-activate';
import type { PipeTransform } from './pipe-transform';
import type { NestInterceptor } from './nest-interceptor';
import type { ExceptionFilter } from './exception-filter';

export interface INestApplication {
  listen(port: number, callback?: () => void): Promise<void>;

  get<T>(token: Type<T> | string | symbol): T;

  useGlobalPipes(...pipes: Array<PipeTransform | Type<PipeTransform>>): void;

  useGlobalGuards(...guards: Array<Type<CanActivate>>): void;

  useGlobalInterceptors(
    ...interceptors: Array<NestInterceptor | Type<NestInterceptor>>
  ): void;

  useGlobalFilters(
    ...filters: Array<ExceptionFilter | Type<ExceptionFilter>>
  ): void;

  close(): Promise<void>;
}
