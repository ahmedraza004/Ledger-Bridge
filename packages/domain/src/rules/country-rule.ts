import { Rule, RuleResult } from './rule-engine';

export interface CountryRuleContext {
  senderCountry: string; // ISO 2-letter
  recipientCountry: string;
}

export class CountryRule implements Rule<CountryRuleContext> {
  public readonly name = 'COUNTRY_JURISDICTION_RULE';

  // Sanctioned / High Risk FATF Blacklist jurisdictions
  private readonly blockedCountries = new Set(['KP', 'IR', 'SY', 'CU', 'RU', 'MM']);
  private readonly highRiskCountries = new Set(['YE', 'VE', 'AF', 'SS']);

  public evaluate(ctx: CountryRuleContext): RuleResult {
    const sender = ctx.senderCountry.toUpperCase();
    const recipient = ctx.recipientCountry.toUpperCase();

    if (this.blockedCountries.has(sender) || this.blockedCountries.has(recipient)) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'DENY',
        reason: `Transaction involves prohibited jurisdiction (${sender} -> ${recipient})`,
        metadata: { senderCountry: sender, recipientCountry: recipient }
      };
    }

    if (this.highRiskCountries.has(sender) || this.highRiskCountries.has(recipient)) {
      return {
        ruleName: this.name,
        passed: false,
        decision: 'MANUAL_REVIEW',
        reason: `Transaction involves elevated risk jurisdiction (${sender} -> ${recipient})`,
        metadata: { senderCountry: sender, recipientCountry: recipient }
      };
    }

    return {
      ruleName: this.name,
      passed: true,
      decision: 'ALLOW'
    };
  }
}
