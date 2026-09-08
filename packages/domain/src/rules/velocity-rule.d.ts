import { Rule, RuleResult } from './rule-engine';
export interface VelocityRuleContext {
    senderRecentTxCountLastHour: number;
    senderRecentVolumeMinorLastHour: bigint;
    maxTxPerHour?: number;
}
export declare class VelocityRule implements Rule<VelocityRuleContext> {
    readonly name = "VELOCITY_LIMIT_RULE";
    private readonly defaultMaxTxPerHour;
    constructor(defaultMaxTxPerHour?: number);
    evaluate(ctx: VelocityRuleContext): RuleResult;
}
//# sourceMappingURL=velocity-rule.d.ts.map