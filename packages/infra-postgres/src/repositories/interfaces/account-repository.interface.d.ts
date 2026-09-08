import { Account } from '@ledgerbridge/domain';
export interface AccountRepository {
    save(account: Account): Promise<void>;
    findById(id: string): Promise<Account | null>;
    findByTenant(tenantId: string): Promise<Account[]>;
}
//# sourceMappingURL=account-repository.interface.d.ts.map