import { AuditRecord } from '@ledgerbridge/domain';
import { AuditRepository } from '../interfaces/audit-repository.interface';

export class InMemoryAuditRepository implements AuditRepository {
  private records: AuditRecord[] = [];

  public async append(record: AuditRecord): Promise<void> {
    this.records.push(record);
  }

  public async findById(id: string): Promise<AuditRecord | null> {
    return this.records.find(r => r.id === id) || null;
  }

  public async findByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    return this.records.filter(r => r.correlationId === correlationId);
  }

  public async findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]> {
    return this.records.filter(r => r.entityType === entityType && r.entityId === entityId);
  }

  public async getLatestRecord(tenantId: string): Promise<AuditRecord | null> {
    const tenantRecords = this.records.filter(r => r.tenantId === tenantId);
    if (tenantRecords.length === 0) return null;
    return tenantRecords[tenantRecords.length - 1];
  }

  public async findRecent(tenantId: string, limit: number = 50): Promise<AuditRecord[]> {
    return this.records
      .filter(r => r.tenantId === tenantId)
      .slice(-limit)
      .reverse();
  }

  public clear(): void {
    this.records = [];
  }
}
