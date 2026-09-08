import { Money } from '../money/money';
export interface PaymentQuoteProps {
    id: string;
    tenantId: string;
    sourceAmount: Money;
    targetCurrency: string;
    exchangeRate: number;
    targetAmount: Money;
    feeAmount: Money;
    expiresAt: Date;
    createdAt: Date;
}
export declare class PaymentQuote {
    readonly id: string;
    readonly tenantId: string;
    readonly sourceAmount: Money;
    readonly targetCurrency: string;
    readonly exchangeRate: number;
    readonly targetAmount: Money;
    readonly feeAmount: Money;
    readonly expiresAt: Date;
    readonly createdAt: Date;
    constructor(props: PaymentQuoteProps);
    isExpired(now?: Date): boolean;
    static create(params: {
        id: string;
        tenantId: string;
        sourceAmount: Money;
        targetCurrency: string;
        exchangeRate: number;
        feeBps?: number;
        ttlSeconds?: number;
    }): PaymentQuote;
}
//# sourceMappingURL=quote.d.ts.map