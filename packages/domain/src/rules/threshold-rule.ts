import { Money } from '../money/money';
import { Rule, RuleResult } from './rule-engine';

export interface ThresholdRuleContext {
  amount: Money;
  thresholdEquivalentUsd?: Money;
}

export class AmountThresholdRule implements Rule<ThresholdRuleContext> {
  public readonly name = 'AMOUNT_THRESHOLD_RULE';
  // Default threshold: $10,000 USD (1,000,000 cents)
  private readonly defaultThresholdMinor: bigint;

  constructor(thresholdMinor: bigint = 1_000_000n) {
    this.defaultThresholdMinor = thresholdMinor;
  }

  public evaluate(ctx: ThresholdRuleContext): RuleResult {
    // If USD equivalent is provided, compare that; otherwise compare if amount is in USD
    const comparisonAmount = ctx.thresholdEquivalentUsd ?? (ctx.amount.currency === 'USD' ? ctx.amount : null);

    if (comparisonAmount && comparisonAmount.amountMinor > this.defaultThresholdMinor) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'MANUAL_REVIEW',
        reason: `Transaction amount (${comparisonAmount.format()}) exceeds the regulatory threshold of $10,000.00 USD and requires compliance approval.`,
        metadata: {
          amountMinor: comparisonAmount.amountMinor.toString(),
          thresholdMinor: this.defaultThresholdMinor.toString()
        }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      decision: 'ALLOW'
    };
  }
}
