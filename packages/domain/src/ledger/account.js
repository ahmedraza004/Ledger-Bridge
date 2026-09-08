"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerAccount = void 0;
class LedgerAccount {
    id;
    tenantId;
    name;
    type;
    currency;
    _status;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.name = props.name;
        this.type = props.type;
        this.currency = props.currency.toUpperCase();
        this._status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    get status() {
        return this._status;
    }
    isActive() {
        return this._status === 'ACTIVE';
    }
    freeze() {
        this._status = 'FROZEN';
    }
    activate() {
        this._status = 'ACTIVE';
    }
    suspend() {
        this._status = 'SUSPENDED';
    }
    isDebitNormal() {
        // Normal balance for Assets and Expenses is DEBIT; Liabilities, Equities, Revenue is CREDIT
        return this.type === 'ASSET' || this.type === 'EXPENSE';
    }
}
exports.LedgerAccount = LedgerAccount;
//# sourceMappingURL=account.js.map