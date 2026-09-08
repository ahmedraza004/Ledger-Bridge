"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaPaymentRepository = void 0;
const domain_1 = require("@ledgerbridge/domain");
class PrismaPaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(payment) {
        await this.prisma.payment.upsert({
            where: { id: payment.id },
            create: {
                id: payment.id,
                tenantId: payment.tenantId,
                sourceAccountId: payment.sender.accountId,
                destinationAccountId: payment.recipient.accountId,
                sourceAmountMinor: payment.sourceAmount.amountMinor,
                sourceCurrency: payment.sourceAmount.currency,
                targetAmountMinor: payment.targetAmount.amountMinor,
                targetCurrency: payment.targetAmount.currency,
                feeAmountMinor: payment.feeAmount.amountMinor,
                quoteId: payment.quoteId,
                reference: payment.reference,
                state: payment.state,
                idempotencyKey: payment.idempotencyKey,
                rejectionReason: payment.rejectionReason,
                ledgerEntryId: payment.ledgerEntryId,
                settlementRailTxId: payment.settlementRailTxId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            },
            update: {
                state: payment.state,
                rejectionReason: payment.rejectionReason,
                ledgerEntryId: payment.ledgerEntryId,
                settlementRailTxId: payment.settlementRailTxId,
                updatedAt: payment.updatedAt
            }
        });
    }
    async findById(id) {
        const raw = await this.prisma.payment.findUnique({
            where: { id },
            include: { sourceAccount: true, destinationAccount: true }
        });
        if (!raw)
            return null;
        return new domain_1.Payment({
            id: raw.id,
            tenantId: raw.tenantId,
            sourceAmount: domain_1.Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
            targetAmount: domain_1.Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
            feeAmount: domain_1.Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
            sender: {
                id: raw.sourceAccount.id,
                name: raw.sourceAccount.name,
                country: 'US',
                accountId: raw.sourceAccountId
            },
            recipient: {
                id: raw.destinationAccount.id,
                name: raw.destinationAccount.name,
                country: 'GB',
                accountId: raw.destinationAccountId
            },
            quoteId: raw.quoteId || undefined,
            reference: raw.reference,
            state: raw.state,
            idempotencyKey: raw.idempotencyKey || undefined,
            rejectionReason: raw.rejectionReason || undefined,
            ledgerEntryId: raw.ledgerEntryId || undefined,
            settlementRailTxId: raw.settlementRailTxId || undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
    async findByIdempotencyKey(key) {
        const raw = await this.prisma.payment.findUnique({
            where: { idempotencyKey: key },
            include: { sourceAccount: true, destinationAccount: true }
        });
        if (!raw)
            return null;
        return new domain_1.Payment({
            id: raw.id,
            tenantId: raw.tenantId,
            sourceAmount: domain_1.Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
            targetAmount: domain_1.Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
            feeAmount: domain_1.Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
            sender: {
                id: raw.sourceAccount.id,
                name: raw.sourceAccount.name,
                country: 'US',
                accountId: raw.sourceAccountId
            },
            recipient: {
                id: raw.destinationAccount.id,
                name: raw.destinationAccount.name,
                country: 'GB',
                accountId: raw.destinationAccountId
            },
            quoteId: raw.quoteId || undefined,
            reference: raw.reference,
            state: raw.state,
            idempotencyKey: raw.idempotencyKey || undefined,
            rejectionReason: raw.rejectionReason || undefined,
            ledgerEntryId: raw.ledgerEntryId || undefined,
            settlementRailTxId: raw.settlementRailTxId || undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
    async findByTenant(tenantId, options) {
        const rawList = await this.prisma.payment.findMany({
            where: {
                tenantId,
                ...(options?.state ? { state: options.state } : {})
            },
            include: { sourceAccount: true, destinationAccount: true },
            skip: options?.offset ?? 0,
            take: options?.limit ?? 50,
            orderBy: { createdAt: 'desc' }
        });
        return rawList.map(raw => new domain_1.Payment({
            id: raw.id,
            tenantId: raw.tenantId,
            sourceAmount: domain_1.Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
            targetAmount: domain_1.Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
            feeAmount: domain_1.Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
            sender: {
                id: raw.sourceAccount.id,
                name: raw.sourceAccount.name,
                country: 'US',
                accountId: raw.sourceAccountId
            },
            recipient: {
                id: raw.destinationAccount.id,
                name: raw.destinationAccount.name,
                country: 'GB',
                accountId: raw.destinationAccountId
            },
            quoteId: raw.quoteId || undefined,
            reference: raw.reference,
            state: raw.state,
            idempotencyKey: raw.idempotencyKey || undefined,
            rejectionReason: raw.rejectionReason || undefined,
            ledgerEntryId: raw.ledgerEntryId || undefined,
            settlementRailTxId: raw.settlementRailTxId || undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }));
    }
    async saveQuote(quote) {
        await this.prisma.paymentQuote.create({
            data: {
                id: quote.id,
                tenantId: quote.tenantId,
                sourceAmount: quote.sourceAmount.amountMinor,
                sourceCurrency: quote.sourceAmount.currency,
                targetAmount: quote.targetAmount.amountMinor,
                targetCurrency: quote.targetAmount.currency,
                exchangeRate: quote.exchangeRate,
                feeAmountMinor: quote.feeAmount.amountMinor,
                expiresAt: quote.expiresAt,
                createdAt: quote.createdAt
            }
        });
    }
    async findQuoteById(id) {
        const raw = await this.prisma.paymentQuote.findUnique({ where: { id } });
        if (!raw)
            return null;
        return new domain_1.PaymentQuote({
            id: raw.id,
            tenantId: raw.tenantId,
            sourceAmount: domain_1.Money.fromMinor(raw.sourceAmount, raw.sourceCurrency),
            targetAmount: domain_1.Money.fromMinor(raw.targetAmount, raw.targetCurrency),
            targetCurrency: raw.targetCurrency,
            exchangeRate: raw.exchangeRate,
            feeAmount: domain_1.Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
            expiresAt: raw.expiresAt,
            createdAt: raw.createdAt
        });
    }
    async countByTenant(tenantId) {
        return this.prisma.payment.count({ where: { tenantId } });
    }
}
exports.PrismaPaymentRepository = PrismaPaymentRepository;
//# sourceMappingURL=prisma-payment.repository.js.map