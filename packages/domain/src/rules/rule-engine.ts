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

export class RuleEngine<TContext> {
  private rules: Rule<TContext>[] = [];

  public register(rule: Rule<TContext>): this {
    this.rules.push(rule);
    return this;
  }

  public async evaluateAll(context: TContext): Promise<{
    finalDecision: ValidationGateDecision;
    results: RuleResult[];
  }> {
    const results: RuleResult[] = [];
    let finalDecision: ValidationGateDecision = 'ALLOW';

    for (const rule of this.rules) {
      const res = await rule.evaluate(context);
      results.push(res);

      if (res.decision === 'DENY') {
        finalDecision = 'DENY';
      } else if (res.decision === 'MANUAL_REVIEW' && finalDecision !== 'DENY') {
        finalDecision = 'MANUAL_REVIEW';
      }
    }

    return {
      finalDecision,
      results
    };
  }
}
