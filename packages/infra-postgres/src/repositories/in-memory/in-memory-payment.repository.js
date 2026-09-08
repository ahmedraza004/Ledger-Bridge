"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryPaymentRepository = void 0;
class InMemoryPaymentRepository {
    payments = new Map();
    quotes = new Map();
    async save(payment) {
        this.payments.set(payment.id, payment);
    }
    async findById(id) {
        return this.payments.get(id) || null;
    }
    async findByIdempotencyKey(key) {
        for (const p of this.payments.values()) {
            if (p.idempotencyKey === key)
                return p;
        }
        return null;
    }
    async findByTenant(tenantId, options) {
        let list = Array.from(this.payments.values()).filter(p => p.tenantId === tenantId);
        if (options?.state) {
            list = list.filter(p => p.state === options.state);
        }
        const offset = options?.offset ?? 0;
        const limit = options?.limit ?? 50;
        return list.slice(offset, offset + limit);
    }
    async saveQuote(quote) {
        this.quotes.set(quote.id, quote);
    }
    async findQuoteById(id) {
        return this.quotes.get(id) || null;
    }
    async countByTenant(tenantId) {
        return Array.from(this.payments.values()).filter(p => p.tenantId === tenantId).length;
    }
    clear() {
        this.payments.clear();
        this.quotes.clear();
    }
}
exports.InMemoryPaymentRepository = InMemoryPaymentRepository;
//# sourceMappingURL=in-memory-payment.repository.js.map