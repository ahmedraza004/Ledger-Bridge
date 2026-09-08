"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceDecisionSchema = exports.CreateAccountSchema = exports.CreatePaymentSchema = exports.CreateQuoteSchema = exports.MoneySchema = exports.CurrencySchema = void 0;
const zod_1 = require("zod");
exports.CurrencySchema = zod_1.z.string().length(3).toUpperCase();
exports.MoneySchema = zod_1.z.object({
    amountMinor: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.bigint()]).transform(val => BigInt(val)),
    currency: exports.CurrencySchema
});
exports.CreateQuoteSchema = zod_1.z.object({
    sourceCurrency: exports.CurrencySchema,
    targetCurrency: exports.CurrencySchema,
    sourceAmountMinor: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.bigint()]).transform(val => BigInt(val)),
    tenantId: zod_1.z.string().min(1)
});
exports.CreatePaymentSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    sourceAccountId: zod_1.z.string().uuid(),
    destinationAccountId: zod_1.z.string().uuid(),
    amountMinor: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.bigint()]).transform(val => BigInt(val)),
    currency: exports.CurrencySchema,
    targetCurrency: exports.CurrencySchema.optional(),
    quoteId: zod_1.z.string().uuid().optional(),
    reference: zod_1.z.string().min(1).max(255),
    senderInfo: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        kycStatus: zod_1.z.enum(['VERIFIED', 'UNVERIFIED', 'PENDING']),
        amlRiskScore: zod_1.z.number().min(0).max(100).optional()
    }),
    recipientInfo: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        kycStatus: zod_1.z.enum(['VERIFIED', 'UNVERIFIED', 'PENDING']).optional(),
        amlRiskScore: zod_1.z.number().min(0).max(100).optional()
    }),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
});
exports.CreateAccountSchema = zod_1.z.object({
    tenantId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(100),
    currency: exports.CurrencySchema,
    type: zod_1.z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
    description: zod_1.z.string().max(255).optional()
});
exports.ComplianceDecisionSchema = zod_1.z.object({
    caseId: zod_1.z.string().min(1),
    decision: zod_1.z.enum(['APPROVED', 'REJECTED']),
    reason: zod_1.z.string().min(5).max(500),
    officerId: zod_1.z.string().min(1)
});
//# sourceMappingURL=schemas.js.map