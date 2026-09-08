import { Payment, PaymentQuote, PaymentState } from '@ledgerbridge/domain';
import { PaymentRepository } from '../interfaces/payment-repository.interface';

export class InMemoryPaymentRepository implements PaymentRepository {
  private payments = new Map<string, Payment>();
  private quotes = new Map<string, PaymentQuote>();

  public async save(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment);
  }

  public async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  public async findByIdempotencyKey(key: string): Promise<Payment | null> {
    for (const p of this.payments.values()) {
      if (p.idempotencyKey === key) return p;
    }
    return null;
  }

  public async findByTenant(
    tenantId: string,
    options?: { state?: PaymentState; limit?: number; offset?: number }
  ): Promise<Payment[]> {
    let list = Array.from(this.payments.values()).filter(p => p.tenantId === tenantId);
    if (options?.state) {
      list = list.filter(p => p.state === options.state);
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    return list.slice(offset, offset + limit);
  }

  public async saveQuote(quote: PaymentQuote): Promise<void> {
    this.quotes.set(quote.id, quote);
  }

  public async findQuoteById(id: string): Promise<PaymentQuote | null> {
    return this.quotes.get(id) || null;
  }

  public async countByTenant(tenantId: string): Promise<number> {
    return Array.from(this.payments.values()).filter(p => p.tenantId === tenantId).length;
  }

  public clear(): void {
    this.payments.clear();
    this.quotes.clear();
  }
}
