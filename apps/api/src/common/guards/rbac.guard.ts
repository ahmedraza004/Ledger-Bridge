import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SecurityContext } from '@ledgerbridge/shared';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Array<string>>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest() as { user?: SecurityContext };
    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: No roles associated with current user session.');
    }

    const hasRole = requiredRoles.some(role => user.roles.includes(role as any));
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required roles [${requiredRoles.join(', ')}] but user possesses [${user.roles.join(', ')}]`
      );
    }

    return true;
  }
}
