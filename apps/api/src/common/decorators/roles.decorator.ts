import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SecurityContext } from '@ledgerbridge/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'admin' | 'operator' | 'compliance_officer' | 'auditor' | 'customer'>) =>
  SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (data: keyof SecurityContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: SecurityContext = request.user;
    return data ? user?.[data] : user;
  }
);
