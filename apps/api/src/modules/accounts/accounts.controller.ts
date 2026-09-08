import { Controller, Post, Get, Body, Param, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { CreateAccountSchema, CreateAccountDto } from '@ledgerbridge/shared';
import { AccountsService } from './accounts.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('accounts')
@UseGuards(OidcAuthGuard, RbacGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles('admin', 'operator')
  public async createAccount(@Body(new ZodValidationPipe(CreateAccountSchema)) dto: CreateAccountDto) {
    const acc = await this.accountsService.createAccount(dto);
    return {
      id: acc.id,
      tenantId: acc.tenantId,
      name: acc.name,
      currency: acc.currency,
      type: acc.type,
      status: acc.status,
      kycTier: acc.kycTier,
      createdAt: acc.createdAt.toISOString()
    };
  }

  @Get(':id')
  @Roles('admin', 'operator', 'compliance_officer', 'auditor', 'customer')
  public async getAccount(@Param('id') id: string) {
    const acc = await this.accountsService.getAccount(id);
    if (!acc) throw new NotFoundException(`Account ${id} not found`);
    return {
      id: acc.id,
      tenantId: acc.tenantId,
      name: acc.name,
      currency: acc.currency,
      type: acc.type,
      status: acc.status,
      kycTier: acc.kycTier,
      createdAt: acc.createdAt.toISOString()
    };
  }

  @Get(':id/balance')
  @Roles('admin', 'operator', 'compliance_officer', 'auditor', 'customer')
  public async getBalance(@Param('id') id: string) {
    const balance = await this.accountsService.getAccountBalance(id);
    if (!balance) throw new NotFoundException(`Account ${id} balance not found`);
    return {
      accountId: balance.accountId,
      accountName: balance.accountName,
      currency: balance.currency,
      debitTotal: balance.debitTotal.toJSON(),
      debitTotalFormatted: balance.debitTotal.format(),
      creditTotal: balance.creditTotal.toJSON(),
      creditTotalFormatted: balance.creditTotal.format(),
      netBalance: balance.netBalance.toJSON(),
      netBalanceFormatted: balance.netBalance.format(),
      isDebitNormal: balance.isDebitNormal
    };
  }

  @Get()
  @Roles('admin', 'operator', 'compliance_officer', 'auditor')
  public async listAccounts(@Query('tenantId') tenantId: string = 'default-tenant') {
    const list = await this.accountsService.listAccounts(tenantId);
    return list.map(acc => ({
      id: acc.id,
      tenantId: acc.tenantId,
      name: acc.name,
      currency: acc.currency,
      type: acc.type,
      status: acc.status,
      kycTier: acc.kycTier,
      createdAt: acc.createdAt.toISOString()
    }));
  }
}
