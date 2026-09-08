import { PrismaClient } from '@prisma/client';
import { Payment, PaymentQuote, PaymentState } from '@ledgerbridge/domain';
import { PaymentRepository } from '../interfaces/payment-repository.interface';
export declare class PrismaPaymentRepository implements PaymentRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
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
//# sourceMappingURL=prisma-payment.repository.d.ts.map