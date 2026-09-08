import { Rule, RuleResult } from './rule-engine';
export interface CountryRuleContext {
    senderCountry: string;
    recipientCountry: string;
}
export declare class CountryRule implements Rule<CountryRuleContext> {
    readonly name = "COUNTRY_JURISDICTION_RULE";
    private readonly blockedCountries;
    private readonly highRiskCountries;
    evaluate(ctx: CountryRuleContext): RuleResult;
}
//# sourceMappingURL=country-rule.d.ts.map