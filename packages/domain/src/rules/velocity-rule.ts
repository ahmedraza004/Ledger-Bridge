import { Rule, RuleResult } from './rule-engine';

export interface VelocityRuleContext {
  senderRecentTxCountLastHour: number;
  senderRecentVolumeMinorLastHour: bigint;
  maxTxPerHour?: number;
}

export class VelocityRule implements Rule<VelocityRuleContext> {
  public readonly name = 'VELOCITY_LIMIT_RULE';
  private readonly defaultMaxTxPerHour: number;

  constructor(defaultMaxTxPerHour: number = 20) {
    this.defaultMaxTxPerHour = defaultMaxTxPerHour;
  }

  public evaluate(ctx: VelocityRuleContext): RuleResult {
    const limit = ctx.maxTxPerHour ?? this.defaultMaxTxPerHour;

    if (ctx.senderRecentTxCountLastHour > limit) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'DENY',
        reason: `Velocity limit exceeded: ${ctx.senderRecentTxCountLastHour} transactions in the last hour exceeds limit of ${limit}`,
        metadata: { txCount: ctx.senderRecentTxCountLastHour, limit }
      };
    }

    if (ctx.senderRecentTxCountLastHour > Math.floor(limit * 0.75)) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'MANUAL_REVIEW',
        reason: `Approaching velocity anomaly threshold (${ctx.senderRecentTxCountLastHour} tx/hr)`,
        metadata: { txCount: ctx.senderRecentTxCountLastHour, limit }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      decision: 'ALLOW'
    };
  }
}
