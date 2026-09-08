"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const shared_1 = require("@ledgerbridge/shared");
class Account {
    id;
    tenantId;
    name;
    type;
    currency;
    _status;
    kycTier;
    metadata;
    createdAt;
    _updatedAt;
    constructor(props) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.name = props.name;
        this.type = props.type;
        this.currency = props.currency.toUpperCase();
        this._status = props.status ?? 'ACTIVE';
        this.kycTier = props.kycTier ?? 1;
        this.metadata = props.metadata ?? {};
        this.createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }
    get status() {
        return this._status;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    isActive() {
        return this._status === 'ACTIVE';
    }
    freeze() {
        this._status = 'FROZEN';
        this._updatedAt = new Date();
    }
    activate() {
        this._status = 'ACTIVE';
        this._updatedAt = new Date();
    }
    suspend() {
        this._status = 'SUSPENDED';
        this._updatedAt = new Date();
    }
    close() {
        this._status = 'CLOSED';
        this._updatedAt = new Date();
    }
    assertCanTransact(amount) {
        if (this._status !== 'ACTIVE') {
            throw new shared_1.DomainError(shared_1.ErrorCode.FORBIDDEN, `Account ${this.id} (${this.name}) is in ${this._status} status and cannot transact.`);
        }
        if (amount.currency !== this.currency) {
            throw new shared_1.DomainError(shared_1.ErrorCode.CURRENCY_MISMATCH, `Account currency (${this.currency}) does not match transaction currency (${amount.currency})`);
        }
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map