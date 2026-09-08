export type CurrencyCode = string;
export interface RawMoney {
    amountMinor: string | number | bigint;
    currency: CurrencyCode;
}
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'SUSPENDED' | 'CLOSED';
export type PostingDirection = 'DEBIT' | 'CREDIT';
export type PaymentState = 'quoted' | 'validated' | 'committed' | 'submitted' | 'settled' | 'reversed' | 'failed';
export type ValidationGateDecision = 'ALLOW' | 'DENY' | 'MANUAL_REVIEW';
export interface UserRole {
    role: 'admin' | 'operator' | 'compliance_officer' | 'auditor' | 'customer';
}
export interface SecurityContext {
    userId: string;
    tenantId: string;
    roles: Array<'admin' | 'operator' | 'compliance_officer' | 'auditor' | 'customer'>;
    correlationId: string;
}
//# sourceMappingURL=types.d.ts.map