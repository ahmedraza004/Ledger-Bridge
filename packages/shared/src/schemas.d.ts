import { z } from 'zod';
export declare const CurrencySchema: z.ZodString;
export declare const MoneySchema: z.ZodObject<{
    amountMinor: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBigInt]>, bigint, string | number | bigint>;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amountMinor: bigint;
    currency: string;
}, {
    amountMinor: string | number | bigint;
    currency: string;
}>;
export declare const CreateQuoteSchema: z.ZodObject<{
    sourceCurrency: z.ZodString;
    targetCurrency: z.ZodString;
    sourceAmountMinor: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBigInt]>, bigint, string | number | bigint>;
    tenantId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmountMinor: bigint;
    tenantId: string;
}, {
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmountMinor: string | number | bigint;
    tenantId: string;
}>;
export declare const CreatePaymentSchema: z.ZodObject<{
    tenantId: z.ZodString;
    sourceAccountId: z.ZodString;
    destinationAccountId: z.ZodString;
    amountMinor: z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBigInt]>, bigint, string | number | bigint>;
    currency: z.ZodString;
    targetCurrency: z.ZodOptional<z.ZodString>;
    quoteId: z.ZodOptional<z.ZodString>;
    reference: z.ZodString;
    senderInfo: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        country: z.ZodString;
        kycStatus: z.ZodEnum<["VERIFIED", "UNVERIFIED", "PENDING"]>;
        amlRiskScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        country: string;
        kycStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
        amlRiskScore?: number | undefined;
    }, {
        id: string;
        name: string;
        country: string;
        kycStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
        amlRiskScore?: number | undefined;
    }>;
    recipientInfo: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        country: z.ZodString;
        kycStatus: z.ZodOptional<z.ZodEnum<["VERIFIED", "UNVERIFIED", "PENDING"]>>;
        amlRiskScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        country: string;
        kycStatus?: "VERIFIED" | "UNVERIFIED" | "PENDING" | undefined;
        amlRiskScore?: number | undefined;
    }, {
        id: string;
        name: string;
        country: string;
        kycStatus?: "VERIFIED" | "UNVERIFIED" | "PENDING" | undefined;
        amlRiskScore?: number | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    amountMinor: bigint;
    currency: string;
    tenantId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    reference: string;
    senderInfo: {
        id: string;
        name: string;
        country: string;
        kycStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
        amlRiskScore?: number | undefined;
    };
    recipientInfo: {
        id: string;
        name: string;
        country: string;
        kycStatus?: "VERIFIED" | "UNVERIFIED" | "PENDING" | undefined;
        amlRiskScore?: number | undefined;
    };
    targetCurrency?: string | undefined;
    quoteId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    amountMinor: string | number | bigint;
    currency: string;
    tenantId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    reference: string;
    senderInfo: {
        id: string;
        name: string;
        country: string;
        kycStatus: "VERIFIED" | "UNVERIFIED" | "PENDING";
        amlRiskScore?: number | undefined;
    };
    recipientInfo: {
        id: string;
        name: string;
        country: string;
        kycStatus?: "VERIFIED" | "UNVERIFIED" | "PENDING" | undefined;
        amlRiskScore?: number | undefined;
    };
    targetCurrency?: string | undefined;
    quoteId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const CreateAccountSchema: z.ZodObject<{
    tenantId: z.ZodString;
    name: z.ZodString;
    currency: z.ZodString;
    type: z.ZodEnum<["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
    currency: string;
    tenantId: string;
    name: string;
    description?: string | undefined;
}, {
    type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
    currency: string;
    tenantId: string;
    name: string;
    description?: string | undefined;
}>;
export declare const ComplianceDecisionSchema: z.ZodObject<{
    caseId: z.ZodString;
    decision: z.ZodEnum<["APPROVED", "REJECTED"]>;
    reason: z.ZodString;
    officerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    caseId: string;
    decision: "APPROVED" | "REJECTED";
    reason: string;
    officerId: string;
}, {
    caseId: string;
    decision: "APPROVED" | "REJECTED";
    reason: string;
    officerId: string;
}>;
export type CreateQuoteDto = z.infer<typeof CreateQuoteSchema>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export type ComplianceDecisionDto = z.infer<typeof ComplianceDecisionSchema>;
//# sourceMappingURL=schemas.d.ts.map