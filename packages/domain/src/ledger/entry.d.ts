import { Posting } from './posting';
export type LedgerEntryStatus = 'DRAFT' | 'COMMITTED' | 'REVERSED';
export interface LedgerEntryProps {
    id: string;
    tenantId: string;
    transactionDate: Date;
    description: string;
    correlationId?: string;
    postings: Posting[];
    status?: LedgerEntryStatus;
    createdAt?: Date;
}
export declare class LedgerEntry {
    readonly id: string;
    readonly tenantId: string;
    readonly transactionDate: Date;
    readonly description: string;
    readonly correlationId?: string;
    readonly postings: readonly Posting[];
    private _status;
    readonly createdAt: Date;
    constructor(props: LedgerEntryProps);
    get status(): LedgerEntryStatus;
    markReversed(): void;
    private validateBalance;
}
//# sourceMappingURL=entry.d.ts.map