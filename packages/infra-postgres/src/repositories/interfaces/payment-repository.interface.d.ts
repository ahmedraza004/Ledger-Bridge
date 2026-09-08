import { Payment, PaymentQuote, PaymentState } from '@ledgerbridge/domain';
export interface PaymentRepository {
    save(payment: Payment): Promise<void>;
    findById(id: string): Promise<Payment | null>;
    findByIdempotencyKey(key: string): Promise<Payment | null>;
    findByTenant(tenantId: string, options?: {
        state?: PaymentState;
        limit?: number;
        offset?: number;
    }): Promise<Payment[]>;
    saveQuote(quote: PaymentQuote): Promise<void>;
    findQuoteById(id: string): Promise<PaymentQuote | null>;
    countByTenant(tenantId: string): Promise<number>;
}
//# sourceMappingURL=payment-repository.interface.d.ts.map