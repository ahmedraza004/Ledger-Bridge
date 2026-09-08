import { z } from 'zod';

export const CurrencySchema = z.string().length(3).toUpperCase();

export const MoneySchema = z.object({
  amountMinor: z.union([z.string(), z.number(), z.bigint()]).transform(val => BigInt(val)),
  currency: CurrencySchema
});

export const CreateQuoteSchema = z.object({
  sourceCurrency: CurrencySchema,
  targetCurrency: CurrencySchema,
  sourceAmountMinor: z.union([z.string(), z.number(), z.bigint()]).transform(val => BigInt(val)),
  tenantId: z.string().min(1)
});

export const CreatePaymentSchema = z.object({
  tenantId: z.string().min(1),
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amountMinor: z.union([z.string(), z.number(), z.bigint()]).transform(val => BigInt(val)),
  currency: CurrencySchema,
  targetCurrency: CurrencySchema.optional(),
  quoteId: z.string().uuid().optional(),
  reference: z.string().min(1).max(255),
  senderInfo: z.object({
    id: z.string(),
    name: z.string().min(1),
    country: z.string().length(2),
    kycStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'PENDING']),
    amlRiskScore: z.number().min(0).max(100).optional()
  }),
  recipientInfo: z.object({
    id: z.string(),
    name: z.string().min(1),
    country: z.string().length(2),
    kycStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'PENDING']).optional(),
    amlRiskScore: z.number().min(0).max(100).optional()
  }),
  metadata: z.record(z.unknown()).optional()
});

export const CreateAccountSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1).max(100),
  currency: CurrencySchema,
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  description: z.string().max(255).optional()
});

export const ComplianceDecisionSchema = z.object({
  caseId: z.string().min(1),
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().min(5).max(500),
  officerId: z.string().min(1)
});

export type CreateQuoteDto = z.infer<typeof CreateQuoteSchema>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type ComplianceDecisionDto = z.infer<typeof ComplianceDecisionSchema>;
