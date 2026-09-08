"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryRule = void 0;
class CountryRule {
    name = 'COUNTRY_JURISDICTION_RULE';
    // Sanctioned / High Risk FATF Blacklist jurisdictions
    blockedCountries = new Set(['KP', 'IR', 'SY', 'CU', 'RU', 'MM']);
    highRiskCountries = new Set(['YE', 'VE', 'AF', 'SS']);
    evaluate(ctx) {
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
exports.CountryRule = CountryRule;
//# sourceMappingURL=country-rule.js.map