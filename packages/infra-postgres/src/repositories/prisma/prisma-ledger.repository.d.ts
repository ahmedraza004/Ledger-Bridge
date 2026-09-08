import { PrismaClient } from '@prisma/client';
import { LedgerAccount, LedgerEntry, Posting, AccountBalance } from '@ledgerbridge/domain';
import { LedgerRepository } from '../interfaces/ledger-repository.interface';
export declare class PrismaLedgerRepository implements LedgerRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    saveAccount(account: LedgerAccount): Promise<void>;
    findAccountById(id: string): Promise<LedgerAccount | null>;
    findAccountsByTenant(tenantId: string): Promise<LedgerAccount[]>;
    saveEntry(entry: LedgerEntry): Promise<void>;
    findEntryById(id: string): Promise<LedgerEntry | null>;
    findEntriesByTenant(tenantId: string): Promise<LedgerEntry[]>;
    findPostingsForAccount(accountId: string): Promise<Posting[]>;
    getAccountBalance(accountId: string): Promise<AccountBalance | null>;
}
//# sourceMappingURL=prisma-ledger.repository.d.ts.map