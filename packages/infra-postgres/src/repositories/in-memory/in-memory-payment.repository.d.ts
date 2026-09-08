import { Payment, PaymentQuote, PaymentState } from '@ledgerbridge/domain';
import { PaymentRepository } from '../interfaces/payment-repository.interface';
export declare class InMemoryPaymentRepository implements PaymentRepository {
    private payments;
    private quotes;
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
    clear(): void;
}
//# sourceMappingURL=in-memory-payment.repository.d.ts.map