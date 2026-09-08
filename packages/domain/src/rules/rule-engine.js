"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngine = void 0;
class RuleEngine {
    rules = [];
    register(rule) {
        this.rules.push(rule);
        return this;
    }
    async evaluateAll(context) {
        const results = [];
        let finalDecision = 'ALLOW';
        for (const rule of this.rules) {
            const res = await rule.evaluate(context);
            results.push(res);
            if (res.decision === 'DENY') {
                finalDecision = 'DENY';
            }
            else if (res.decision === 'MANUAL_REVIEW' && finalDecision !== 'DENY') {
                finalDecision = 'MANUAL_REVIEW';
            }
        }
        return {
            finalDecision,
            results
        };
    }
}
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=rule-engine.js.map