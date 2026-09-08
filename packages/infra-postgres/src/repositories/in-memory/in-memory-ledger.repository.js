"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLedgerRepository = void 0;
const domain_1 = require("@ledgerbridge/domain");
class InMemoryLedgerRepository {
    accounts = new Map();
    entries = new Map();
    postings = [];
    async saveAccount(account) {
        this.accounts.set(account.id, account);
    }
    async findAccountById(id) {
        return this.accounts.get(id) || null;
    }
    async findAccountsByTenant(tenantId) {
        return Array.from(this.accounts.values()).filter(a => a.tenantId === tenantId);
    }
    async saveEntry(entry) {
        this.entries.set(entry.id, entry);
        for (const p of entry.postings) {
            this.postings.push(p);
        }
    }
    async findEntryById(id) {
        return this.entries.get(id) || null;
    }
    async findEntriesByTenant(tenantId) {
        return Array.from(this.entries.values()).filter(e => e.tenantId === tenantId);
    }
    async findPostingsForAccount(accountId) {
        return this.postings.filter(p => p.accountId === accountId);
    }
    async getAccountBalance(accountId) {
        const account = await this.findAccountById(accountId);
        if (!account)
            return null;
        const accountPostings = await this.findPostingsForAccount(accountId);
        return domain_1.DoubleEntryLedger.calculateAccountBalance(account, accountPostings);
    }
    clear() {
        this.accounts.clear();
        this.entries.clear();
        this.postings = [];
    }
}
exports.InMemoryLedgerRepository = InMemoryLedgerRepository;
//# sourceMappingURL=in-memory-ledger.repository.js.map