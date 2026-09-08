import { Rule, RuleResult } from './rule-engine';

export interface AmlRuleContext {
  senderAmlRiskScore?: number; // 0 (low) to 100 (high)
  recipientAmlRiskScore?: number;
  senderIsSanctioned?: boolean;
  recipientIsSanctioned?: boolean;
  isPoliticallyExposed?: boolean;
}

export class AmlRule implements Rule<AmlRuleContext> {
  public readonly name = 'AML_SANCTIONS_RULE';

  public evaluate(ctx: AmlRuleContext): RuleResult {
    if (ctx.senderIsSanctioned || ctx.recipientIsSanctioned) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'DENY',
        reason: 'Transaction blocked: Participant is listed on international sanctions list',
        metadata: {
          senderSanctioned: ctx.senderIsSanctioned,
          recipientSanctioned: ctx.recipientIsSanctioned
        }
      };
    }

    const maxRisk = Math.max(ctx.senderAmlRiskScore ?? 0, ctx.recipientAmlRiskScore ?? 0);

    if (maxRisk >= 85) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'DENY',
        reason: `Critical AML risk score: ${maxRisk} >= 85`,
        metadata: { riskScore: maxRisk }
      };
    }

    if (maxRisk >= 60 || ctx.isPoliticallyExposed) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'MANUAL_REVIEW',
        reason: `Elevated AML risk score (${maxRisk}) or PEP involvement requires compliance sign-off`,
        metadata: { riskScore: maxRisk, isPEP: ctx.isPoliticallyExposed }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      decision: 'ALLOW',
      metadata: { riskScore: maxRisk }
    };
  }
}
