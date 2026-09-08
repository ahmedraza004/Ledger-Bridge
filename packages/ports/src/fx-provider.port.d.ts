import { Money } from '@ledgerbridge/domain';
export interface FxRateRequest {
    fromCurrency: string;
    toCurrency: string;
}
export interface FxRateResponse {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    provider: string;
    timestamp: Date;
}
export interface GuaranteedQuoteRequest {
    sourceAmount: Money;
    targetCurrency: string;
    ttlSeconds?: number;
}
export interface GuaranteedQuoteResponse {
    quoteId: string;
    sourceAmount: Money;
    targetAmount: Money;
    exchangeRate: number;
    feeAmount: Money;
    expiresAt: Date;
}
export interface FxProvider {
    readonly providerName: string;
    getExchangeRate(request: FxRateRequest): Promise<FxRateResponse>;
    getGuaranteedQuote(request: GuaranteedQuoteRequest): Promise<GuaranteedQuoteResponse>;
}
//# sourceMappingURL=fx-provider.port.d.ts.map