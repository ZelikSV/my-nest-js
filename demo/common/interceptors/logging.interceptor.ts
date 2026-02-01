import type { ExecutionContext, NestInterceptor, CallHandler } from '../../../core';

export class LoggingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    const start = Date.now();
    console.log(`[Interceptor] Before: ${method} ${url} -> ${controllerName}.${handlerName}`);

    try {
      const result = await next.handle();

      const duration = Date.now() - start;
      console.log(`[Interceptor] After: ${method} ${url} - ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`[Interceptor] Error: ${method} ${url} - ${duration}ms`);
      throw error;
    }
  }
}
