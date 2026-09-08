"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuditRepository = void 0;
const domain_1 = require("@ledgerbridge/domain");
class PrismaAuditRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async append(record) {
        await this.prisma.auditLog.create({
            data: {
                id: record.id,
                tenantId: record.tenantId,
                actor: record.actor,
                action: record.action,
                entityType: record.entityType,
                entityId: record.entityId,
                beforeState: record.beforeState,
                afterState: record.afterState,
                timestamp: record.timestamp,
                correlationId: record.correlationId,
                previousHash: record.previousHash,
                hash: record.hash
            }
        });
    }
    async findById(id) {
        const raw = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!raw)
            return null;
        return new domain_1.AuditRecord({
            id: raw.id,
            tenantId: raw.tenantId,
            actor: raw.actor,
            action: raw.action,
            entityType: raw.entityType,
            entityId: raw.entityId,
            beforeState: raw.beforeState,
            afterState: raw.afterState,
            timestamp: raw.timestamp,
            correlationId: raw.correlationId,
            previousHash: raw.previousHash
        });
    }
    async findByCorrelationId(correlationId) {
        const list = await this.prisma.auditLog.findMany({
            where: { correlationId },
            orderBy: { timestamp: 'asc' }
        });
        return list.map(raw => new domain_1.AuditRecord({
            id: raw.id,
            tenantId: raw.tenantId,
            actor: raw.actor,
            action: raw.action,
            entityType: raw.entityType,
            entityId: raw.entityId,
            beforeState: raw.beforeState,
            afterState: raw.afterState,
            timestamp: raw.timestamp,
            correlationId: raw.correlationId,
            previousHash: raw.previousHash
        }));
    }
    async findByEntity(entityType, entityId) {
        const list = await this.prisma.auditLog.findMany({
            where: { entityType, entityId },
            orderBy: { timestamp: 'asc' }
        });
        return list.map(raw => new domain_1.AuditRecord({
            id: raw.id,
            tenantId: raw.tenantId,
            actor: raw.actor,
            action: raw.action,
            entityType: raw.entityType,
            entityId: raw.entityId,
            beforeState: raw.beforeState,
            afterState: raw.afterState,
            timestamp: raw.timestamp,
            correlationId: raw.correlationId,
            previousHash: raw.previousHash
        }));
    }
    async getLatestRecord(tenantId) {
        const raw = await this.prisma.auditLog.findFirst({
            where: { tenantId },
            orderBy: { timestamp: 'desc' }
        });
        if (!raw)
            return null;
        return new domain_1.AuditRecord({
            id: raw.id,
            tenantId: raw.tenantId,
            actor: raw.actor,
            action: raw.action,
            entityType: raw.entityType,
            entityId: raw.entityId,
            beforeState: raw.beforeState,
            afterState: raw.afterState,
            timestamp: raw.timestamp,
            correlationId: raw.correlationId,
            previousHash: raw.previousHash
        });
    }
    async findRecent(tenantId, limit = 50) {
        const list = await this.prisma.auditLog.findMany({
            where: { tenantId },
            take: limit,
            orderBy: { timestamp: 'desc' }
        });
        return list.map(raw => new domain_1.AuditRecord({
            id: raw.id,
            tenantId: raw.tenantId,
            actor: raw.actor,
            action: raw.action,
            entityType: raw.entityType,
            entityId: raw.entityId,
            beforeState: raw.beforeState,
            afterState: raw.afterState,
            timestamp: raw.timestamp,
            correlationId: raw.correlationId,
            previousHash: raw.previousHash
        }));
    }
}
exports.PrismaAuditRepository = PrismaAuditRepository;
//# sourceMappingURL=prisma-audit.repository.js.map