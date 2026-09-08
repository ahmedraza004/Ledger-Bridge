import { Controller, Get, Param, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('audit')
@UseGuards(OidcAuthGuard, RbacGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('records')
  @Roles('admin', 'auditor', 'compliance_officer')
  public async listRecent(
    @Query('tenantId') tenantId: string = 'default-tenant',
    @Query('limit') limit: string = '50'
  ) {
    const list = await this.auditService.listRecent(tenantId, parseInt(limit, 10));
    return list.map(r => ({
      id: r.id,
      tenantId: r.tenantId,
      actor: r.actor,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      beforeState: r.beforeState,
      afterState: r.afterState,
      timestamp: r.timestamp.toISOString(),
      correlationId: r.correlationId,
      previousHash: r.previousHash,
      hash: r.hash,
      isVerified: r.verifyIntegrity()
    }));
  }

  @Get('correlation/:id')
  @Roles('admin', 'auditor', 'compliance_officer')
  public async getByCorrelation(@Param('id') correlationId: string) {
    const list = await this.auditService.getByCorrelationId(correlationId);
    return list.map(r => ({
      id: r.id,
      tenantId: r.tenantId,
      actor: r.actor,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      beforeState: r.beforeState,
      afterState: r.afterState,
      timestamp: r.timestamp.toISOString(),
      correlationId: r.correlationId,
      previousHash: r.previousHash,
      hash: r.hash,
      isVerified: r.verifyIntegrity()
    }));
  }
}
