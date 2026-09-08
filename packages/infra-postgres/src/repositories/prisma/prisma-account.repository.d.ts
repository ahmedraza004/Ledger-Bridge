import { PrismaClient } from '@prisma/client';
import { Account } from '@ledgerbridge/domain';
import { AccountRepository } from '../interfaces/account-repository.interface';
export declare class PrismaAccountRepository implements AccountRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    save(account: Account): Promise<void>;
    findById(id: string): Promise<Account | null>;
    findByTenant(tenantId: string): Promise<Account[]>;
}
//# sourceMappingURL=prisma-account.repository.d.ts.map