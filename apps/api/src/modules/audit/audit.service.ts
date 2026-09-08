import { Injectable } from '@nestjs/common';
import { AuditRecord } from '@ledgerbridge/domain';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class AuditService {
  constructor(private readonly paymentsService: PaymentsService) {}

  public async getRecord(id: string): Promise<AuditRecord | null> {
    return this.paymentsService.repos.audit.findById(id);
  }

  public async getByCorrelationId(correlationId: string): Promise<AuditRecord[]> {
    return this.paymentsService.repos.audit.findByCorrelationId(correlationId);
  }

  public async getByEntity(entityType: string, entityId: string): Promise<AuditRecord[]> {
    return this.paymentsService.repos.audit.findByEntity(entityType, entityId);
  }

  public async listRecent(tenantId: string, limit: number = 50): Promise<AuditRecord[]> {
    return this.paymentsService.repos.audit.findRecent(tenantId, limit);
  }
}
