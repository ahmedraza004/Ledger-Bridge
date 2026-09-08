import { ValidationGateDecision } from '@ledgerbridge/shared';
import { Money } from '../money/money';
import { RuleResult } from '../rules/rule-engine';
export interface PaymentValidationContext {
    paymentId: string;
    tenantId: string;
    amount: Money;
    thresholdUsdEquivalent?: Money;
    sender: {
        id: string;
        name: string;
        country: string;
        kycStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
        amlRiskScore?: number;
        isPoliticallyExposed?: boolean;
        recentTxCountLastHour?: number;
        recentVolumeMinorLastHour?: bigint;
    };
    recipient: {
        id: string;
        name: string;
        country: string;
        kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
        amlRiskScore?: number;
        isSanctioned?: boolean;
    };
}
export interface ValidationGateResult {
    decision: ValidationGateDecision;
    reasons: string[];
    ruleResults: RuleResult[];
    validatedAt: Date;
}
export declare class PaymentValidationGate {
    private readonly kycRule;
    private readonly amlRule;
    private readonly thresholdRule;
    private readonly countryRule;
    private readonly velocityRule;
    validate(context: PaymentValidationContext): Promise<ValidationGateResult>;
}
//# sourceMappingURL=validation-gate.d.ts.map