"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VelocityRule = void 0;
class VelocityRule {
    name = 'VELOCITY_LIMIT_RULE';
    defaultMaxTxPerHour;
    constructor(defaultMaxTxPerHour = 20) {
        this.defaultMaxTxPerHour = defaultMaxTxPerHour;
    }
    evaluate(ctx) {
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
exports.VelocityRule = VelocityRule;
//# sourceMappingURL=velocity-rule.js.map