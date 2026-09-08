"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAuditRepository = void 0;
class InMemoryAuditRepository {
    records = [];
    async append(record) {
        this.records.push(record);
    }
    async findById(id) {
        return this.records.find(r => r.id === id) || null;
    }
    async findByCorrelationId(correlationId) {
        return this.records.filter(r => r.correlationId === correlationId);
    }
    async findByEntity(entityType, entityId) {
        return this.records.filter(r => r.entityType === entityType && r.entityId === entityId);
    }
    async getLatestRecord(tenantId) {
        const tenantRecords = this.records.filter(r => r.tenantId === tenantId);
        if (tenantRecords.length === 0)
            return null;
        return tenantRecords[tenantRecords.length - 1];
    }
    async findRecent(tenantId, limit = 50) {
        return this.records
            .filter(r => r.tenantId === tenantId)
            .slice(-limit)
            .reverse();
    }
    clear() {
        this.records = [];
    }
}
exports.InMemoryAuditRepository = InMemoryAuditRepository;
//# sourceMappingURL=in-memory-audit.repository.js.map