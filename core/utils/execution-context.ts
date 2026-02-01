import type { Request, Response } from 'express';

import type { Type } from '../types';

export interface ArgumentsHost {
  switchToHttp(): HttpArgumentsHost;

  getType(): string;
}

export interface HttpArgumentsHost {
  getRequest<T = Request>(): T;
  getResponse<T = Response>(): T;
  getNext<T = Function>(): T;
}

export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;

  getHandler(): Function;
}

export class ExpressExecutionContext implements ExecutionContext {
  constructor(
    private readonly controllerClass: Type,
    private readonly handler: Function,
    private readonly request: Request,
    private readonly response: Response,
    private readonly nextFn?: Function
  ) {}

  getClass<T = any>(): Type<T> {
    return this.controllerClass as Type<T>;
  }

  getHandler(): Function {
    return this.handler;
  }

  getType(): string {
    return 'http';
  }

  switchToHttp(): HttpArgumentsHost {
    return {
      getRequest: <T = Request>() => this.request as T,
      getResponse: <T = Response>() => this.response as T,
      getNext: <T = Function>() => (this.nextFn ?? (() => {})) as T,
    };
  }
}

export function createExecutionContext(
  controllerClass: Type,
  handler: Function,
  req: Request,
  res: Response,
  next?: Function
): ExecutionContext {
  return new ExpressExecutionContext(controllerClass, handler, req, res, next);
}
