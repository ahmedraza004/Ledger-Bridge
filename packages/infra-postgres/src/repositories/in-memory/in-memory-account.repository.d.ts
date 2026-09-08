import { Account } from '@ledgerbridge/domain';
import { AccountRepository } from '../interfaces/account-repository.interface';
export declare class InMemoryAccountRepository implements AccountRepository {
    private accounts;
    save(account: Account): Promise<void>;
    findById(id: string): Promise<Account | null>;
    findByTenant(tenantId: string): Promise<Account[]>;
    clear(): void;
}
//# sourceMappingURL=in-memory-account.repository.d.ts.map