import type { Request, Response } from 'express';
import { container } from '../container.js';
import { Type, ArgumentMetadata } from '../types.js';
import { getMethodParamMetadata } from '../decorators/param.js';
import { getGuards } from '../decorators/use-guards.js';
import { getPipes } from '../decorators/use-pipes.js';
import { getInterceptors } from '../decorators/use-interceptors.js';
import { getFilters } from '../decorators/use-filters.js';
import {
  createExecutionContext,
  ExecutionContext,
  ArgumentsHost,
} from '../utils/execution-context.js';
import { extractParamValue } from '../utils/extract-params.js';
import { isClass, isInstance } from '../utils/is-class.js';
import { HttpException, ForbiddenException } from '../exceptions/http.exception.js';
import type { PipeTransform } from '../interfaces/pipe-transform.js';
import type { CanActivate } from '../interfaces/can-activate.js';
import type { NestInterceptor, CallHandler } from '../interfaces/nest-interceptor.js';
import type { ExceptionFilter } from '../interfaces/exception-filter.js';

interface GlobalMiddleware {
  pipes: Array<PipeTransform | Type<PipeTransform>>;
  guards: Array<Type<CanActivate>>;
  interceptors: Array<NestInterceptor | Type<NestInterceptor>>;
  filters: Array<ExceptionFilter | Type<ExceptionFilter>>;
}

export const globalMiddleware: GlobalMiddleware = {
  pipes: [],
  guards: [],
  interceptors: [],
  filters: [],
};

function resolvePipe(pipe: PipeTransform | Type<PipeTransform>): PipeTransform {
  if (isClass(pipe)) {
    if (!container.hasProvider(pipe)) {
      container.register(pipe);
    }
    return container.resolve(pipe);
  }
  return pipe;
}

function resolveGuard(guard: Type<CanActivate>): CanActivate {
  if (!container.hasProvider(guard)) {
    container.register(guard);
  }
  return container.resolve(guard);
}

function resolveInterceptor(
  interceptor: NestInterceptor | Type<NestInterceptor>
): NestInterceptor {
  if (isClass(interceptor)) {
    if (!container.hasProvider(interceptor)) {
      container.register(interceptor);
    }
    return container.resolve(interceptor);
  }
  return interceptor;
}

function resolveFilter(
  filter: ExceptionFilter | Type<ExceptionFilter>
): ExceptionFilter {
  if (isClass(filter)) {
    if (!container.hasProvider(filter)) {
      container.register(filter);
    }
    return container.resolve(filter);
  }
  return filter;
}

function collectPipes(
  controllerClass: Type,
  handler: Function,
  paramPipes?: Array<Type | object>
): PipeTransform[] {
  const pipes: PipeTransform[] = [];

  for (const pipe of globalMiddleware.pipes) {
    pipes.push(resolvePipe(pipe));
  }

  const controllerPipes = getPipes(controllerClass);
  for (const pipe of controllerPipes) {
    pipes.push(resolvePipe(pipe));
  }

  const methodPipes = getPipes(handler);
  for (const pipe of methodPipes) {
    pipes.push(resolvePipe(pipe));
  }

  if (paramPipes) {
    for (const pipe of paramPipes) {
      pipes.push(resolvePipe(pipe as PipeTransform | Type<PipeTransform>));
    }
  }

  return pipes;
}

async function runPipes(
  value: any,
  metadata: ArgumentMetadata,
  pipes: PipeTransform[]
): Promise<any> {
  let result = value;

  for (const pipe of pipes) {
    result = await pipe.transform(result, metadata);
  }

  return result;
}

async function extractAndTransformParams(
  controllerClass: Type,
  handler: Function,
  req: Request
): Promise<any[]> {
  const paramMetadata = getMethodParamMetadata(controllerClass, handler.name);
  const args: any[] = [];

  for (const metadata of paramMetadata) {
    let value = extractParamValue(req, metadata.type, metadata.data);

    const pipes = collectPipes(controllerClass, handler, metadata.pipes);

    value = await runPipes(value, metadata, pipes);

    args[metadata.index] = value;
  }

  return args;
}

function collectGuards(
  controllerClass: Type,
  handler: Function
): CanActivate[] {
  const guards: CanActivate[] = [];

  for (const guard of globalMiddleware.guards) {
    guards.push(resolveGuard(guard));
  }

  const controllerGuards = getGuards(controllerClass);
  for (const guard of controllerGuards) {
    guards.push(resolveGuard(guard));
  }

  const methodGuards = getGuards(handler);
  for (const guard of methodGuards) {
    guards.push(resolveGuard(guard));
  }

  return guards;
}

async function runGuards(
  ctx: ExecutionContext,
  guards: CanActivate[]
): Promise<boolean> {
  for (const guard of guards) {
    const canActivate = await guard.canActivate(ctx);
    if (!canActivate) {
      return false;
    }
  }
  return true;
}

function collectInterceptors(
  controllerClass: Type,
  handler: Function
): NestInterceptor[] {
  const interceptors: NestInterceptor[] = [];

  for (const interceptor of globalMiddleware.interceptors) {
    interceptors.push(resolveInterceptor(interceptor));
  }

  const controllerInterceptors = getInterceptors(controllerClass);
  for (const interceptor of controllerInterceptors) {
    interceptors.push(resolveInterceptor(interceptor));
  }

  const methodInterceptors = getInterceptors(handler);
  for (const interceptor of methodInterceptors) {
    interceptors.push(resolveInterceptor(interceptor));
  }

  return interceptors;
}

async function runInterceptors(
  ctx: ExecutionContext,
  interceptors: NestInterceptor[],
  finalHandler: () => Promise<any>
): Promise<any> {
  let handler = finalHandler;

  for (let i = interceptors.length - 1; i >= 0; i--) {
    const interceptor = interceptors[i];
    const nextHandler = handler;

    handler = async () => {
      const callHandler: CallHandler = {
        handle: () => nextHandler(),
      };
      return interceptor.intercept(ctx, callHandler);
    };
  }

  return handler();
}

function collectFilters(
  controllerClass: Type,
  handler: Function
): ExceptionFilter[] {
  const filters: ExceptionFilter[] = [];

  const methodFilters = getFilters(handler);
  for (const filter of methodFilters) {
    filters.push(resolveFilter(filter));
  }

  const controllerFilters = getFilters(controllerClass);
  for (const filter of controllerFilters) {
    filters.push(resolveFilter(filter));
  }

  for (const filter of globalMiddleware.filters) {
    filters.push(resolveFilter(filter));
  }

  return filters;
}

async function handleException(
  error: any,
  host: ArgumentsHost,
  filters: ExceptionFilter[]
): Promise<boolean> {
  for (const filter of filters) {
    try {
      await filter.catch(error, host);
      return true;
    } catch {
    }
  }
  return false;
}

export async function executePipeline(
  controllerClass: Type,
  controllerInstance: any,
  handler: Function,
  handlerName: string,
  req: Request,
  res: Response
): Promise<void> {
  const ctx = createExecutionContext(controllerClass, handler, req, res);
  const filters = collectFilters(controllerClass, handler);

  try {
    const args = await extractAndTransformParams(controllerClass, handler, req);

    const guards = collectGuards(controllerClass, handler);
    const canActivate = await runGuards(ctx, guards);

    if (!canActivate) {
      throw new ForbiddenException('Access denied by guard');
    }

    const interceptors = collectInterceptors(controllerClass, handler);

    const result = await runInterceptors(ctx, interceptors, async () => {
      const boundMethod = controllerInstance[handlerName].bind(controllerInstance);
      return boundMethod(...args);
    });

    if (result !== undefined) {
      res.json(result);
    }
  } catch (error) {
    const handled = await handleException(error, ctx, filters);

    if (!handled) {
      if (error instanceof HttpException) {
        res.status(error.status).json(error.getResponse());
      } else {
        console.error('Unhandled error:', error);
        res.status(500).json({
          statusCode: 500,
          message: error instanceof Error ? error.message : 'Internal server error',
          error: 'Internal Server Error',
        });
      }
    }
  }
}
