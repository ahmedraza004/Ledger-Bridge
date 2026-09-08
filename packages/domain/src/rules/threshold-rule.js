"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmountThresholdRule = void 0;
class AmountThresholdRule {
    name = 'AMOUNT_THRESHOLD_RULE';
    // Default threshold: $10,000 USD (1,000,000 cents)
    defaultThresholdMinor;
    constructor(thresholdMinor = 1000000n) {
        this.defaultThresholdMinor = thresholdMinor;
    }
    evaluate(ctx) {
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
exports.AmountThresholdRule = AmountThresholdRule;
//# sourceMappingURL=threshold-rule.js.map