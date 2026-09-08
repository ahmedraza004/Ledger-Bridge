import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ComplianceDecisionSchema, ComplianceDecisionDto } from '@ledgerbridge/shared';
import { ComplianceService } from './compliance.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('compliance')
@UseGuards(OidcAuthGuard, RbacGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('cases')
  @Roles('compliance_officer', 'admin')
  public async listCases(@Query('tenantId') tenantId: string = 'default-tenant') {
    return this.complianceService.listPendingCases(tenantId);
  }

  @Post('cases/decide')
  @Roles('compliance_officer') // Strict: Only compliance_officer can sign off
  public async decideCase(@Body(new ZodValidationPipe(ComplianceDecisionSchema)) dto: ComplianceDecisionDto) {
    return this.complianceService.decideCase(dto);
  }
}
