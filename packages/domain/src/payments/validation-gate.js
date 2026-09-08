"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidationGate = void 0;
const kyc_rule_1 = require("../rules/kyc-rule");
const aml_rule_1 = require("../rules/aml-rule");
const threshold_rule_1 = require("../rules/threshold-rule");
const country_rule_1 = require("../rules/country-rule");
const velocity_rule_1 = require("../rules/velocity-rule");
class PaymentValidationGate {
    kycRule = new kyc_rule_1.KycRule();
    amlRule = new aml_rule_1.AmlRule();
    thresholdRule = new threshold_rule_1.AmountThresholdRule();
    countryRule = new country_rule_1.CountryRule();
    velocityRule = new velocity_rule_1.VelocityRule();
    async validate(context) {
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
        let decision = 'ALLOW';
        const reasons = [];
        for (const r of ruleResults) {
            if (r.decision === 'DENY') {
                decision = 'DENY';
                if (r.reason)
                    reasons.push(r.reason);
            }
            else if (r.decision === 'MANUAL_REVIEW') {
                if (decision !== 'DENY') {
                    decision = 'MANUAL_REVIEW';
                }
                if (r.reason)
                    reasons.push(r.reason);
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
exports.PaymentValidationGate = PaymentValidationGate;
//# sourceMappingURL=validation-gate.js.map