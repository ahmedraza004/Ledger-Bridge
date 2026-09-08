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

export class KycRule implements Rule<KycRuleContext> {
  public readonly name = 'KYC_VERIFICATION_RULE';

  public evaluate(ctx: KycRuleContext): RuleResult {
    if (ctx.sender.kycStatus !== 'VERIFIED') {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'DENY',
        reason: `Sender ${ctx.sender.id} KYC status is ${ctx.sender.kycStatus}, must be VERIFIED`
      };
    }

    if (ctx.recipient?.kycStatus && ctx.recipient.kycStatus === 'UNVERIFIED') {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'MANUAL_REVIEW',
        reason: `Recipient ${ctx.recipient.id} KYC status is UNVERIFIED`
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      decision: 'ALLOW'
    };
  }
}
