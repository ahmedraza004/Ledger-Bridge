import { Money } from '@ledgerbridge/domain';
export interface SubmitPayoutRequest {
    paymentId: string;
    sourceAmount: Money;
    targetAmount: Money;
    senderName: string;
    recipientName: string;
    recipientIbanOrAccountNumber: string;
    recipientBankCode: string;
    reference: string;
}
export interface PayoutSubmissionResponse {
    railTxId: string;
    railName: string;
    status: 'SUBMITTED' | 'SETTLED' | 'PENDING' | 'REJECTED';
    feeCharged: Money;
    submittedAt: Date;
    estimatedSettlementDate: Date;
}
export interface PaymentRailProvider {
    readonly railName: string;
    submitPayout(request: SubmitPayoutRequest): Promise<PayoutSubmissionResponse>;
    checkPayoutStatus(railTxId: string): Promise<PayoutSubmissionResponse>;
}
//# sourceMappingURL=payment-rail-provider.port.d.ts.map