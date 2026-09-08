import { ValidationGateDecision } from '@ledgerbridge/shared';
export interface RuleResult {
    ruleName: string;
    passed: boolean;
    decision: ValidationGateDecision;
    reason?: string;
    metadata?: Record<string, unknown>;
}
export interface Rule<TContext> {
    name: string;
    evaluate(context: TContext): Promise<RuleResult> | RuleResult;
}
export declare class RuleEngine<TContext> {
    private rules;
    register(rule: Rule<TContext>): this;
    evaluateAll(context: TContext): Promise<{
        finalDecision: ValidationGateDecision;
        results: RuleResult[];
    }>;
}
//# sourceMappingURL=rule-engine.d.ts.map