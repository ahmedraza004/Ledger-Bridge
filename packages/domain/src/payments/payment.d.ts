import { PaymentState } from '@ledgerbridge/shared';
import { Money } from '../money/money';
export interface PaymentParticipant {
    id: string;
    name: string;
    country: string;
    accountId: string;
    kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
}
export interface PaymentProps {
    id: string;
    tenantId: string;
    sourceAmount: Money;
    targetAmount: Money;
    feeAmount: Money;
    sender: PaymentParticipant;
    recipient: PaymentParticipant;
    quoteId?: string;
    reference: string;
    state?: PaymentState;
    idempotencyKey?: string;
    rejectionReason?: string;
    ledgerEntryId?: string;
    settlementRailTxId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Payment {
    readonly id: string;
    readonly tenantId: string;
    readonly sourceAmount: Money;
    readonly targetAmount: Money;
    readonly feeAmount: Money;
    readonly sender: PaymentParticipant;
    readonly recipient: PaymentParticipant;
    readonly quoteId?: string;
    readonly reference: string;
    private _state;
    readonly idempotencyKey?: string;
    private _rejectionReason?;
    private _ledgerEntryId?;
    private _settlementRailTxId?;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: PaymentProps);
    get state(): PaymentState;
    get rejectionReason(): string | undefined;
    get ledgerEntryId(): string | undefined;
    get settlementRailTxId(): string | undefined;
    get updatedAt(): Date;
    transitionTo(newState: PaymentState, reason?: string): void;
    linkLedgerEntry(entryId: string): void;
    linkSettlementRail(railTxId: string): void;
}
//# sourceMappingURL=payment.d.ts.map