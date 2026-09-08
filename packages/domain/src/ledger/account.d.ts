import { AccountStatus, AccountType } from '@ledgerbridge/shared';
export interface LedgerAccountProps {
    id: string;
    tenantId: string;
    name: string;
    type: AccountType;
    currency: string;
    status: AccountStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LedgerAccount {
    readonly id: string;
    readonly tenantId: string;
    readonly name: string;
    readonly type: AccountType;
    readonly currency: string;
    private _status;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(props: LedgerAccountProps);
    get status(): AccountStatus;
    isActive(): boolean;
    freeze(): void;
    activate(): void;
    suspend(): void;
    isDebitNormal(): boolean;
}
//# sourceMappingURL=account.d.ts.map