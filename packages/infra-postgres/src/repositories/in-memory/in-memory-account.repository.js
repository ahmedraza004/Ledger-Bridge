"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAccountRepository = void 0;
class InMemoryAccountRepository {
    accounts = new Map();
    async save(account) {
        this.accounts.set(account.id, account);
    }
    async findById(id) {
        return this.accounts.get(id) || null;
    }
    async findByTenant(tenantId) {
        return Array.from(this.accounts.values()).filter(a => a.tenantId === tenantId);
    }
    clear() {
        this.accounts.clear();
    }
}
exports.InMemoryAccountRepository = InMemoryAccountRepository;
//# sourceMappingURL=in-memory-account.repository.js.map