import { Injectable, NotFoundException } from '@nestjs/common';
import { ComplianceDecisionDto } from '@ledgerbridge/shared';
import { PaymentsService } from '../payments/payments.service';

export interface ComplianceCaseItem {
  id: string;
  tenantId: string;
  paymentId: string;
  amountFormatted: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reasons: string[];
  senderName: string;
  recipientName: string;
  officerId?: string;
  decidedAt?: Date;
  createdAt: Date;
}

@Injectable()
export class ComplianceService {
  private cases = new Map<string, ComplianceCaseItem>();

  constructor(private readonly paymentsService: PaymentsService) {
    // Seed initial demo compliance cases
    const case1: ComplianceCaseItem = {
      id: 'case-demo-1',
      tenantId: 'default-tenant',
      paymentId: 'pay-high-val-1',
      amountFormatted: '$45,000.00 USD',
      status: 'PENDING',
      reasons: ['Transaction amount ($45,000.00 USD) exceeds $10,000.00 threshold'],
      senderName: 'Apex International Corp',
      recipientName: 'Global Commodities FZ-LLC',
      createdAt: new Date(Date.now() - 3600 * 1000)
    };
    this.cases.set(case1.id, case1);
  }

  public async listPendingCases(tenantId: string): Promise<ComplianceCaseItem[]> {
    return Array.from(this.cases.values()).filter(c => c.tenantId === tenantId);
  }

  public async decideCase(dto: ComplianceDecisionDto): Promise<ComplianceCaseItem> {
    const c = this.cases.get(dto.caseId);
    if (!c) throw new NotFoundException(`Compliance case ${dto.caseId} not found`);

    c.status = dto.decision;
    c.officerId = dto.officerId;
    c.decidedAt = new Date();

    return c;
  }
}
