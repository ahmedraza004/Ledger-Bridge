import { PrismaClient } from '@prisma/client';
import { AuditRecord } from '@ledgerbridge/domain';
import { AuditRepository } from '../interfaces/audit-repository.interface';

export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async append(record: AuditRecord): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: record.id,
        tenantId: record.tenantId,
        actor: record.actor,
        action: record.action,
        entityType: record.entityType,
        entityId: record.entityId,
        beforeState: record.beforeState as any,
        afterState: record.afterState as any,
        timestamp: record.timestamp,
        correlationId: record.correlationId,
        previousHash: record.previousHash,
        hash: record.hash
      }
    });
  }

  public async findById(id: string): Promise<AuditRecord | null> {
    const raw = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!raw) return null;

    return new AuditRecord({
      id: raw.id,
      tenantId: raw.tenantId,
      actor: raw.actor,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      beforeState: raw.beforeState as any,
      afterState: raw.afterState as any,
      timestamp: raw.timestamp,
      correlationId: raw.correlationId,
      previousHash: raw.previousHash
    });
  }

  public async findByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    const list = await this.prisma.auditLog.findMany({
      where: { correlationId },
      orderBy: { timestamp: 'asc' }
    });

    return list.map(raw => new AuditRecord({
      id: raw.id,
      tenantId: raw.tenantId,
      actor: raw.actor,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      beforeState: raw.beforeState as any,
      afterState: raw.afterState as any,
      timestamp: raw.timestamp,
      correlationId: raw.correlationId,
      previousHash: raw.previousHash
    }));
  }

  public async findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]> {
    const list = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'asc' }
    });

    return list.map(raw => new AuditRecord({
      id: raw.id,
      tenantId: raw.tenantId,
      actor: raw.actor,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      beforeState: raw.beforeState as any,
      afterState: raw.afterState as any,
      timestamp: raw.timestamp,
      correlationId: raw.correlationId,
      previousHash: raw.previousHash
    }));
  }

  public async getLatestRecord(tenantId: string): Promise<AuditRecord | null> {
    const raw = await this.prisma.auditLog.findFirst({
      where: { tenantId },
      orderBy: { timestamp: 'desc' }
    });
    if (!raw) return null;

    return new AuditRecord({
      id: raw.id,
      tenantId: raw.tenantId,
      actor: raw.actor,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      beforeState: raw.beforeState as any,
      afterState: raw.afterState as any,
      timestamp: raw.timestamp,
      correlationId: raw.correlationId,
      previousHash: raw.previousHash
    });
  }

  public async findRecent(tenantId: string, limit: number = 50): Promise<AuditRecord[]> {
    const list = await this.prisma.auditLog.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { timestamp: 'desc' }
    });

    return list.map(raw => new AuditRecord({
      id: raw.id,
      tenantId: raw.tenantId,
      actor: raw.actor,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      beforeState: raw.beforeState as any,
      afterState: raw.afterState as any,
      timestamp: raw.timestamp,
      correlationId: raw.correlationId,
      previousHash: raw.previousHash
    }));
  }
}
