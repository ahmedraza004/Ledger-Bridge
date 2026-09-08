import { ValidationGateDecision } from '@ledgerbridge/shared';
import { Money } from '../money/money';
import { RuleEngine, RuleResult } from '../rules/rule-engine';
import { KycRule, KycRuleContext } from '../rules/kyc-rule';
import { AmlRule, AmlRuleContext } from '../rules/aml-rule';
import { AmountThresholdRule, ThresholdRuleContext } from '../rules/threshold-rule';
import { CountryRule, CountryRuleContext } from '../rules/country-rule';
import { VelocityRule, VelocityRuleContext } from '../rules/velocity-rule';

export interface PaymentValidationContext {
  paymentId: string;
  tenantId: string;
  amount: Money;
  thresholdUsdEquivalent?: Money;
  sender: {
    id: string;
    name: string;
    country: string;
    kycStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    amlRiskScore?: number;
    isPoliticallyExposed?: boolean;
    recentTxCountLastHour?: number;
    recentVolumeMinorLastHour?: bigint;
  };
  recipient: {
    id: string;
    name: string;
    country: string;
    kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    amlRiskScore?: number;
    isSanctioned?: boolean;
  };
}

export interface ValidationGateResult {
  decision: ValidationGateDecision;
  reasons: string[];
  ruleResults: RuleResult[];
  validatedAt: Date;
}

export class PaymentValidationGate {
  private readonly kycRule = new KycRule();
  private readonly amlRule = new AmlRule();
  private readonly thresholdRule = new AmountThresholdRule();
  private readonly countryRule = new CountryRule();
  private readonly velocityRule = new VelocityRule();

  public async validate(context: PaymentValidationContext): Promise<ValidationGateResult> {
    const kycResult = this.kycRule.evaluate({
      sender: context.sender,
      recipient: context.recipient
    });

    const amlResult = this.amlRule.evaluate({
      senderAmlRiskScore: context.sender.amlRiskScore,
      recipientAmlRiskScore: context.recipient.amlRiskScore,
      recipientIsSanctioned: context.recipient.isSanctioned,
      isPoliticallyExposed: context.sender.isPoliticallyExposed
    });

    const thresholdResult = this.thresholdRule.evaluate({
      amount: context.amount,
      thresholdEquivalentUsd: context.thresholdUsdEquivalent
    });

    const countryResult = this.countryRule.evaluate({
      senderCountry: context.sender.country,
      recipientCountry: context.recipient.country
    });

    const velocityResult = this.velocityRule.evaluate({
      senderRecentTxCountLastHour: context.sender.recentTxCountLastHour ?? 1,
      senderRecentVolumeMinorLastHour: context.sender.recentVolumeMinorLastHour ?? 0n
    });

    const ruleResults = [kycResult, amlResult, thresholdResult, countryResult, velocityResult];

    let decision: ValidationGateDecision = 'ALLOW';
    const reasons: string[] = [];

    for (const r of ruleResults) {
      if (r.decision === 'DENY') {
        decision = 'DENY';
        if (r.reason) reasons.push(r.reason);
      } else if (r.decision === 'MANUAL_REVIEW') {
        if (decision !== 'DENY') {
          decision = 'MANUAL_REVIEW';
        }
        if (r.reason) reasons.push(r.reason);
      }
    }

    return {
      decision,
      reasons,
      ruleResults,
      validatedAt: new Date()
    };
  }
}
