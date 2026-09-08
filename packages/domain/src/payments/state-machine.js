"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStateMachine = exports.VALID_PAYMENT_TRANSITIONS = void 0;
const shared_1 = require("@ledgerbridge/shared");
exports.VALID_PAYMENT_TRANSITIONS = {
    quoted: ['validated', 'failed'],
    validated: ['committed', 'failed'],
    committed: ['submitted', 'failed'],
    submitted: ['settled', 'failed'],
    settled: ['reversed'],
    reversed: [],
    failed: []
};
class PaymentStateMachine {
    static canTransition(from, to) {
        const allowed = exports.VALID_PAYMENT_TRANSITIONS[from];
        return allowed ? allowed.includes(to) : false;
    }
    static assertTransition(from, to, paymentId) {
        if (!this.canTransition(from, to)) {
            throw new shared_1.DomainError(shared_1.ErrorCode.INVALID_STATE_TRANSITION, `Invalid payment state transition from '${from}' to '${to}' for payment ${paymentId}. Allowed targets: [${exports.VALID_PAYMENT_TRANSITIONS[from]?.join(', ') || 'none'}]`);
        }
    }
}
exports.PaymentStateMachine = PaymentStateMachine;
//# sourceMappingURL=state-machine.js.map