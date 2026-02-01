import type { ExecutionContext } from '../utils/execution-context.js';

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
