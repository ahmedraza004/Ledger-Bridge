"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Posting = void 0;
const shared_1 = require("@ledgerbridge/shared");
class Posting {
    id;
    ledgerEntryId;
    accountId;
    amount;
    direction;
    sequence;
    constructor(props) {
        if (props.amount.isZero() || props.amount.isNegative()) {
            throw new shared_1.DomainError(shared_1.ErrorCode.INVALID_AMOUNT, 'Posting amount must be strictly positive and non-zero');
        }
        this.id = props.id;
        this.ledgerEntryId = props.ledgerEntryId;
        this.accountId = props.accountId;
        this.amount = props.amount;
        this.direction = props.direction;
        this.sequence = props.sequence ?? 0;
        Object.freeze(this);
    }
    isDebit() {
        return this.direction === 'DEBIT';
    }
    isCredit() {
        return this.direction === 'CREDIT';
    }
}
exports.Posting = Posting;
//# sourceMappingURL=posting.js.map