import { Account } from '@ledgerbridge/domain';
import { AccountRepository } from '../interfaces/account-repository.interface';

export class InMemoryAccountRepository implements AccountRepository {
  private accounts = new Map<string, Account>();

  public async save(account: Account): Promise<void> {
    this.accounts.set(account.id, account);
  }

  public async findById(id: string): Promise<Account | null> {
    return this.accounts.get(id) || null;
  }

  public async findByTenant(tenantId: string): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(a => a.tenantId === tenantId);
  }

  public clear(): void {
    this.accounts.clear();
  }
}
