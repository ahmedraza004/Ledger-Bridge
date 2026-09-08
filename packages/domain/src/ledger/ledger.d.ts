import { LedgerAccount } from './account';
import { LedgerEntry } from './entry';
import { Posting } from './posting';
import { Money } from '../money/money';
export interface AccountBalance {
    accountId: string;
    accountName: string;
    currency: string;
    debitTotal: Money;
    creditTotal: Money;
    netBalance: Money;
    isDebitNormal: boolean;
}
export declare class DoubleEntryLedger {
    static calculateAccountBalance(account: LedgerAccount, postings: Posting[]): AccountBalance;
    static createTransferEntry(params: {
        id: string;
        tenantId: string;
        sourceAccountId: string;
        destinationAccountId: string;
        amount: Money;
        description: string;
        correlationId?: string;
    }): LedgerEntry;
    static createFeeTransferEntry(params: {
        id: string;
        tenantId: string;
        sourceAccountId: string;
        destinationAccountId: string;
        feeAccountId: string;
        principalAmount: Money;
        feeAmount: Money;
        description: string;
        correlationId?: string;
    }): LedgerEntry;
}
//# sourceMappingURL=ledger.d.ts.map