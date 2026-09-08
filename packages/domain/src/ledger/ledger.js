"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleEntryLedger = void 0;
const entry_1 = require("./entry");
const posting_1 = require("./posting");
const money_1 = require("../money/money");
class DoubleEntryLedger {
    static calculateAccountBalance(account, postings) {
        let debits = 0n;
        let credits = 0n;
        for (const p of postings) {
            if (p.accountId === account.id) {
                if (p.isDebit()) {
                    debits += p.amount.amountMinor;
                }
                else {
                    credits += p.amount.amountMinor;
                }
            }
        }
        const netMinor = account.isDebitNormal() ? debits - credits : credits - debits;
        return {
            accountId: account.id,
            accountName: account.name,
            currency: account.currency,
            debitTotal: money_1.Money.fromMinor(debits, account.currency),
            creditTotal: money_1.Money.fromMinor(credits, account.currency),
            netBalance: money_1.Money.fromMinor(netMinor, account.currency),
            isDebitNormal: account.isDebitNormal()
        };
    }
    static createTransferEntry(params) {
        // Standard asset transfer: Credit source asset, Debit destination asset
        const debitPosting = new posting_1.Posting({
            accountId: params.destinationAccountId,
            amount: params.amount,
            direction: 'DEBIT',
            sequence: 1
        });
        const creditPosting = new posting_1.Posting({
            accountId: params.sourceAccountId,
            amount: params.amount,
            direction: 'CREDIT',
            sequence: 2
        });
        return new entry_1.LedgerEntry({
            id: params.id,
            tenantId: params.tenantId,
            transactionDate: new Date(),
            description: params.description,
            correlationId: params.correlationId,
            postings: [debitPosting, creditPosting]
        });
    }
    static createFeeTransferEntry(params) {
        const totalDeducted = params.principalAmount.add(params.feeAmount);
        const creditSource = new posting_1.Posting({
            accountId: params.sourceAccountId,
            amount: totalDeducted,
            direction: 'CREDIT',
            sequence: 1
        });
        const debitDestination = new posting_1.Posting({
            accountId: params.destinationAccountId,
            amount: params.principalAmount,
            direction: 'DEBIT',
            sequence: 2
        });
        const debitFee = new posting_1.Posting({
            accountId: params.feeAccountId,
            amount: params.feeAmount,
            direction: 'DEBIT',
            sequence: 3
        });
        return new entry_1.LedgerEntry({
            id: params.id,
            tenantId: params.tenantId,
            transactionDate: new Date(),
            description: params.description,
            correlationId: params.correlationId,
            postings: [creditSource, debitDestination, debitFee]
        });
    }
}
exports.DoubleEntryLedger = DoubleEntryLedger;
//# sourceMappingURL=ledger.js.map