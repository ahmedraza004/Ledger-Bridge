import { Rule, RuleResult } from './rule-engine';
export interface AmlRuleContext {
    senderAmlRiskScore?: number;
    recipientAmlRiskScore?: number;
    senderIsSanctioned?: boolean;
    recipientIsSanctioned?: boolean;
    isPoliticallyExposed?: boolean;
}
export declare class AmlRule implements Rule<AmlRuleContext> {
    readonly name = "AML_SANCTIONS_RULE";
    evaluate(ctx: AmlRuleContext): RuleResult;
}
//# sourceMappingURL=aml-rule.d.ts.map