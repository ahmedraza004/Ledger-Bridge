import { Injectable } from '@nestjs/common';
import { Account, LedgerAccount } from '@ledgerbridge/domain';
import { CreateAccountDto } from '@ledgerbridge/shared';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class AccountsService {
  constructor(private readonly paymentsService: PaymentsService) {}

  public async createAccount(dto: CreateAccountDto): Promise<Account> {
    const id = crypto.randomUUID();
    const account = new Account({
      id,
      tenantId: dto.tenantId,
      name: dto.name,
      currency: dto.currency,
      type: dto.type,
      status: 'ACTIVE',
      kycTier: 1,
      metadata: { description: dto.description }
    });

    await this.paymentsService.repos.accounts.save(account);

    // Also provision corresponding LedgerAccount for double-entry
    await this.paymentsService.repos.ledger.saveAccount(
      new LedgerAccount({
        id,
        tenantId: dto.tenantId,
        name: `${dto.name} Ledger`,
        type: dto.type,
        currency: dto.currency,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );

    return account;
  }

  public async getAccount(id: string): Promise<Account | null> {
    return this.paymentsService.repos.accounts.findById(id);
  }

  public async listAccounts(tenantId: string): Promise<Account[]> {
    return this.paymentsService.repos.accounts.findByTenant(tenantId);
  }

  public async getAccountBalance(id: string) {
    return this.paymentsService.repos.ledger.getAccountBalance(id);
  }
}
