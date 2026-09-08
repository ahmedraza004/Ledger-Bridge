import {
  LedgerAccount,
  LedgerEntry,
  Posting,
  AccountBalance,
  DoubleEntryLedger
} from '@ledgerbridge/domain';
import { LedgerRepository } from '../interfaces/ledger-repository.interface';

export class InMemoryLedgerRepository implements LedgerRepository {
  private accounts = new Map<string, LedgerAccount>();
  private entries = new Map<string, LedgerEntry>();
  private postings: Posting[] = [];

  public async saveAccount(account: LedgerAccount): Promise<void> {
    this.accounts.set(account.id, account);
  }

  public async findAccountById(id: string): Promise<LedgerAccount | null> {
    return this.accounts.get(id) || null;
  }

  public async findAccountsByTenant(tenantId: string): Promise<LedgerAccount[]> {
    return Array.from(this.accounts.values()).filter(a => a.tenantId === tenantId);
  }

  public async saveEntry(entry: LedgerEntry): Promise<void> {
    this.entries.set(entry.id, entry);
    for (const p of entry.postings) {
      this.postings.push(p);
    }
  }

  public async findEntryById(id: string): Promise<LedgerEntry | null> {
    return this.entries.get(id) || null;
  }

  public async findEntriesByTenant(tenantId: string): Promise<LedgerEntry[]> {
    return Array.from(this.entries.values()).filter(e => e.tenantId === tenantId);
  }

  public async findPostingsForAccount(accountId: string): Promise<Posting[]> {
    return this.postings.filter(p => p.accountId === accountId);
  }

  public async getAccountBalance(accountId: string): Promise<AccountBalance | null> {
    const account = await this.findAccountById(accountId);
    if (!account) return null;
    const accountPostings = await this.findPostingsForAccount(accountId);
    return DoubleEntryLedger.calculateAccountBalance(account, accountPostings);
  }

  public clear(): void {
    this.accounts.clear();
    this.entries.clear();
    this.postings = [];
  }
}
