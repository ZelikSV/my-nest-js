import type { ArgumentsHost } from '../utils';

export interface ExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost): void | Promise<void>;
}
