import { Money } from '../money/money';
import { Rule, RuleResult } from './rule-engine';
export interface ThresholdRuleContext {
    amount: Money;
    thresholdEquivalentUsd?: Money;
}
export declare class AmountThresholdRule implements Rule<ThresholdRuleContext> {
    readonly name = "AMOUNT_THRESHOLD_RULE";
    private readonly defaultThresholdMinor;
    constructor(thresholdMinor?: bigint);
    evaluate(ctx: ThresholdRuleContext): RuleResult;
}
//# sourceMappingURL=threshold-rule.d.ts.map