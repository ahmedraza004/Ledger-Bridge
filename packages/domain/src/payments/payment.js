"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const shared_1 = require("@ledgerbridge/shared");
const state_machine_1 = require("./state-machine");
class Payment {
    id;
    tenantId;
    sourceAmount;
    targetAmount;
    feeAmount;
    sender;
    recipient;
    quoteId;
    reference;
    _state;
    idempotencyKey;
    _rejectionReason;
    _ledgerEntryId;
    _settlementRailTxId;
    createdAt;
    _updatedAt;
    constructor(props) {
        if (props.sourceAmount.isZero() || props.sourceAmount.isNegative()) {
            throw new shared_1.DomainError(shared_1.ErrorCode.INVALID_AMOUNT, 'Payment source amount must be strictly positive');
        }
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.sourceAmount = props.sourceAmount;
        this.targetAmount = props.targetAmount;
        this.feeAmount = props.feeAmount;
        this.sender = props.sender;
        this.recipient = props.recipient;
        this.quoteId = props.quoteId;
        this.reference = props.reference;
        this._state = props.state ?? 'quoted';
        this.idempotencyKey = props.idempotencyKey;
        this._rejectionReason = props.rejectionReason;
        this._ledgerEntryId = props.ledgerEntryId;
        this._settlementRailTxId = props.settlementRailTxId;
        this.createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }
    get state() {
        return this._state;
    }
    get rejectionReason() {
        return this._rejectionReason;
    }
    get ledgerEntryId() {
        return this._ledgerEntryId;
    }
    get settlementRailTxId() {
        return this._settlementRailTxId;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    transitionTo(newState, reason) {
        state_machine_1.PaymentStateMachine.assertTransition(this._state, newState, this.id);
        this._state = newState;
        if (reason) {
            this._rejectionReason = reason;
        }
        this._updatedAt = new Date();
    }
    linkLedgerEntry(entryId) {
        this._ledgerEntryId = entryId;
        this._updatedAt = new Date();
    }
    linkSettlementRail(railTxId) {
        this._settlementRailTxId = railTxId;
        this._updatedAt = new Date();
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map