import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SecurityContext } from '@ledgerbridge/shared';

@Injectable()
export class OidcAuthGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const tenantHeader = request.headers['x-tenant-id'] || 'default-tenant';
    const correlationHeader = request.headers['x-correlation-id'] || `corr_${Date.now()}`;

    // Development/Local and Bearer mock token parser for testing
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Simple mock decoding for testing tokens e.g. "Bearer admin" or "Bearer compliance_officer" or standard JWT
      if (token === 'admin' || token.includes('admin')) {
        request.user = {
          userId: 'usr-admin-1',
          tenantId: tenantHeader,
          roles: ['admin', 'operator'],
          correlationId: correlationHeader
        } as SecurityContext;
        return true;
      }

      if (token === 'compliance' || token.includes('compliance_officer')) {
        request.user = {
          userId: 'usr-compliance-1',
          tenantId: tenantHeader,
          roles: ['compliance_officer'],
          correlationId: correlationHeader
        } as SecurityContext;
        return true;
      }

      if (token === 'auditor' || token.includes('auditor')) {
        request.user = {
          userId: 'usr-auditor-1',
          tenantId: tenantHeader,
          roles: ['auditor'],
          correlationId: correlationHeader
        } as SecurityContext;
        return true;
      }

      // Default authenticated customer
      request.user = {
        userId: 'usr-customer-1',
        tenantId: tenantHeader,
        roles: ['customer'],
        correlationId: correlationHeader
      } as SecurityContext;
      return true;
    }

    // Default mock user for zero-friction local developer demo
    request.user = {
      userId: 'usr-dev-admin',
      tenantId: tenantHeader,
      roles: ['admin', 'operator', 'compliance_officer', 'auditor', 'customer'],
      correlationId: correlationHeader
    } as SecurityContext;

    return true;
  }
}
