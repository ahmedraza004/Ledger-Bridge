import { AccountStatus, AccountType } from '@ledgerbridge/shared';
import { Money } from '../money/money';
export interface AccountProps {
    id: string;
    tenantId: string;
    name: string;
    type: AccountType;
    currency: string;
    status?: AccountStatus;
    kycTier?: number;
    metadata?: Record<string, unknown>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Account {
    readonly id: string;
    readonly tenantId: string;
    readonly name: string;
    readonly type: AccountType;
    readonly currency: string;
    private _status;
    readonly kycTier: number;
    readonly metadata: Record<string, unknown>;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: AccountProps);
    get status(): AccountStatus;
    get updatedAt(): Date;
    isActive(): boolean;
    freeze(): void;
    activate(): void;
    suspend(): void;
    close(): void;
    assertCanTransact(amount: Money): void;
}
//# sourceMappingURL=account.d.ts.map