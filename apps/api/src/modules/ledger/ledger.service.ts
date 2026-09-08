import { Injectable } from '@nestjs/common';
import { LedgerEntry } from '@ledgerbridge/domain';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class LedgerService {
  constructor(private readonly paymentsService: PaymentsService) {}

  public async getEntry(id: string): Promise<LedgerEntry | null> {
    return this.paymentsService.repos.ledger.findEntryById(id);
  }

  public async listEntries(tenantId: string): Promise<LedgerEntry[]> {
    return this.paymentsService.repos.ledger.findEntriesByTenant(tenantId);
  }

  public async getAccountBalance(accountId: string) {
    return this.paymentsService.repos.ledger.getAccountBalance(accountId);
  }
}
