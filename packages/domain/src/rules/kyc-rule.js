"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycRule = void 0;
class KycRule {
    name = 'KYC_VERIFICATION_RULE';
    evaluate(ctx) {
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
exports.KycRule = KycRule;
//# sourceMappingURL=kyc-rule.js.map