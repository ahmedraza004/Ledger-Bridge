import { AuditRecord } from '@ledgerbridge/domain';
import { AuditRepository } from '../interfaces/audit-repository.interface';
export declare class InMemoryAuditRepository implements AuditRepository {
    private records;
    append(record: AuditRecord): Promise<void>;
    findById(id: string): Promise<AuditRecord | null>;
    findByCorrelationId(correlationId: string): Promise<AuditRecord[]>;
    findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]>;
    getLatestRecord(tenantId: string): Promise<AuditRecord | null>;
    findRecent(tenantId: string, limit?: number): Promise<AuditRecord[]>;
    clear(): void;
}
//# sourceMappingURL=in-memory-audit.repository.d.ts.map