import { LedgerAccount, LedgerEntry, Posting, AccountBalance } from '@ledgerbridge/domain';

export interface LedgerRepository {
  saveAccount(account: LedgerAccount): Promise<void>;
  findAccountById(id: string): Promise<LedgerAccount | null>;
  findAccountsByTenant(tenantId: string): Promise<LedgerAccount[]>;
  saveEntry(entry: LedgerEntry): Promise<void>;
  findEntryById(id: string): Promise<LedgerEntry | null>;
  findEntriesByTenant(tenantId: string): Promise<LedgerEntry[]>;
  findPostingsForAccount(accountId: string): Promise<Posting[]>;
  getAccountBalance(accountId: string): Promise<AccountBalance | null>;
}
