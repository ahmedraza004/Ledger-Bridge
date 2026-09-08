import { Rule, RuleResult } from './rule-engine';
export interface KycRuleContext {
    sender: {
        id: string;
        kycStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    };
    recipient?: {
        id: string;
        kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    };
}
export declare class KycRule implements Rule<KycRuleContext> {
    readonly name = "KYC_VERIFICATION_RULE";
    evaluate(ctx: KycRuleContext): RuleResult;
}
//# sourceMappingURL=kyc-rule.d.ts.map