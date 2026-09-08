import { Controller, Get, Param, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('ledger')
@UseGuards(OidcAuthGuard, RbacGuard)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('entries/:id')
  @Roles('admin', 'operator', 'auditor', 'compliance_officer')
  public async getEntry(@Param('id') id: string) {
    const entry = await this.ledgerService.getEntry(id);
    if (!entry) throw new NotFoundException(`Ledger entry ${id} not found`);

    return {
      id: entry.id,
      tenantId: entry.tenantId,
      transactionDate: entry.transactionDate.toISOString(),
      description: entry.description,
      correlationId: entry.correlationId,
      status: entry.status,
      postings: entry.postings.map(p => ({
        accountId: p.accountId,
        amount: p.amount.toJSON(),
        amountFormatted: p.amount.format(),
        direction: p.direction,
        sequence: p.sequence
      }))
    };
  }

  @Get('entries')
  @Roles('admin', 'operator', 'auditor', 'compliance_officer')
  public async listEntries(@Query('tenantId') tenantId: string = 'default-tenant') {
    const entries = await this.ledgerService.listEntries(tenantId);
    return entries.map(entry => ({
      id: entry.id,
      tenantId: entry.tenantId,
      transactionDate: entry.transactionDate.toISOString(),
      description: entry.description,
      correlationId: entry.correlationId,
      status: entry.status,
      postingsCount: entry.postings.length,
      postings: entry.postings.map(p => ({
        accountId: p.accountId,
        amount: p.amount.toJSON(),
        amountFormatted: p.amount.format(),
        direction: p.direction,
        sequence: p.sequence
      }))
    }));
  }
}
