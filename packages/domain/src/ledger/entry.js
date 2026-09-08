"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEntry = void 0;
const shared_1 = require("@ledgerbridge/shared");
class LedgerEntry {
    id;
    tenantId;
    transactionDate;
    description;
    correlationId;
    postings;
    _status;
    createdAt;
    constructor(props) {
        if (!props.postings || props.postings.length < 2) {
            throw new shared_1.DomainError(shared_1.ErrorCode.LEDGER_UNBALANCED, 'A ledger entry must contain at least 2 postings');
        }
        this.validateBalance(props.postings);
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.transactionDate = props.transactionDate;
        this.description = props.description;
        this.correlationId = props.correlationId;
        this.postings = Object.freeze([...props.postings]);
        this._status = props.status ?? 'COMMITTED';
        this.createdAt = props.createdAt ?? new Date();
    }
    get status() {
        return this._status;
    }
    markReversed() {
        this._status = 'REVERSED';
    }
    validateBalance(postings) {
        // Group totals by currency
        const totalsByCurrency = {};
        for (const posting of postings) {
            const curr = posting.amount.currency;
            if (!totalsByCurrency[curr]) {
                totalsByCurrency[curr] = { debits: 0n, credits: 0n };
            }
            if (posting.isDebit()) {
                totalsByCurrency[curr].debits += posting.amount.amountMinor;
            }
            else {
                totalsByCurrency[curr].credits += posting.amount.amountMinor;
            }
        }
        for (const [curr, totals] of Object.entries(totalsByCurrency)) {
            if (totals.debits !== totals.credits) {
                throw new shared_1.DomainError(shared_1.ErrorCode.LEDGER_UNBALANCED, `Ledger entry is unbalanced for currency ${curr}: Total Debits (${totals.debits}) != Total Credits (${totals.credits})`);
            }
        }
    }
}
exports.LedgerEntry = LedgerEntry;
//# sourceMappingURL=entry.js.map