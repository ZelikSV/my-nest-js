import { Injectable, ExecutionContext, SetMetadata, Reflector, CanActivate } from '../../../core';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('[RolesGuard] No roles required, access granted');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-role'] as string;

    console.log(
      `[RolesGuard] Required: [${requiredRoles.join(', ')}], User: ${userRole || 'none'}`
    );

    const hasRole = !!userRole && requiredRoles.includes(userRole);

    if (!hasRole) {
      console.log('[RolesGuard] Access denied');
    } else {
      console.log('[RolesGuard] Access granted');
    }

    return hasRole;
  }
}
