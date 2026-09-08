import { AuditRecord } from '@ledgerbridge/domain';
export interface AuditRepository {
    append(record: AuditRecord): Promise<void>;
    findById(id: string): Promise<AuditRecord | null>;
    findByCorrelationId(correlationId: string): Promise<AuditRecord[]>;
    findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]>;
    getLatestRecord(tenantId: string): Promise<AuditRecord | null>;
    findRecent(tenantId: string, limit?: number): Promise<AuditRecord[]>;
}
//# sourceMappingURL=audit-repository.interface.d.ts.map