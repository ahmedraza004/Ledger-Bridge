import { PostingDirection } from '@ledgerbridge/shared';
import { Money } from '../money/money';
export interface PostingProps {
    id?: string;
    ledgerEntryId?: string;
    accountId: string;
    amount: Money;
    direction: PostingDirection;
    sequence?: number;
}
export declare class Posting {
    readonly id?: string;
    readonly ledgerEntryId?: string;
    readonly accountId: string;
    readonly amount: Money;
    readonly direction: PostingDirection;
    readonly sequence: number;
    constructor(props: PostingProps);
    isDebit(): boolean;
    isCredit(): boolean;
}
//# sourceMappingURL=posting.d.ts.map