import type { ArgumentsHost, ExceptionFilter, HttpException } from '../../../core';

export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.status || 500;

    console.log(
      `[Filter] ${request.method} ${request.url} - ${status} ${exception.message}`
    );

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
