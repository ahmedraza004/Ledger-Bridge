import { Injectable } from '@nestjs/common';
import { CreatePaymentDto, SecurityContext } from '@ledgerbridge/shared';
import { Payment } from '@ledgerbridge/domain';
import {
  InMemoryPaymentRepository,
  InMemoryLedgerRepository,
  InMemoryAuditRepository,
  InMemoryAccountRepository
} from '@ledgerbridge/infra-postgres';
import { MockPaymentRailAdapter } from '@ledgerbridge/adapters';
import {
  PaymentOrchestrator,
  IdempotencyService,
  QueueService,
  PaymentExecutionResult
} from '@ledgerbridge/orchestration';
import { TelemetryService } from '../../common/telemetry/telemetry.service';

@Injectable()
export class PaymentsService {
  private readonly paymentRepo = new InMemoryPaymentRepository();
  private readonly ledgerRepo = new InMemoryLedgerRepository();
  private readonly auditRepo = new InMemoryAuditRepository();
  private readonly accountRepo = new InMemoryAccountRepository();
  private readonly railAdapter = new MockPaymentRailAdapter();
  private readonly idempotency = new IdempotencyService();
  private readonly queue = new QueueService();
  private readonly orchestrator: PaymentOrchestrator;

  constructor(private readonly telemetry: TelemetryService) {
    this.orchestrator = new PaymentOrchestrator(
      this.paymentRepo,
      this.ledgerRepo,
      this.auditRepo,
      this.accountRepo,
      this.railAdapter,
      this.idempotency,
      this.queue
    );
  }

  public get repos() {
    return {
      payments: this.paymentRepo,
      ledger: this.ledgerRepo,
      audit: this.auditRepo,
      accounts: this.accountRepo
    };
  }

  public async createPayment(dto: CreatePaymentDto, user: SecurityContext): Promise<PaymentExecutionResult> {
    const result = await this.orchestrator.executePayment({
      tenantId: dto.tenantId,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: dto.destinationAccountId,
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      targetCurrency: dto.targetCurrency,
      quoteId: dto.quoteId,
      reference: dto.reference,
      idempotencyKey: user.correlationId,
      senderInfo: dto.senderInfo,
      recipientInfo: dto.recipientInfo,
      correlationId: user.correlationId
    });

    if (result.payment.state === 'settled') {
      this.telemetry.paymentsProcessedTotal.inc({
        tenant_id: dto.tenantId,
        currency: dto.currency
      });
    } else if (result.payment.state === 'failed') {
      this.telemetry.paymentsFailedTotal.inc({
        tenant_id: dto.tenantId,
        reason_code: 'RULE_VIOLATION'
      });
    }

    return result;
  }

  public async getPayment(id: string): Promise<Payment | null> {
    return this.paymentRepo.findById(id);
  }

  public async listPayments(tenantId: string) {
    return this.paymentRepo.findByTenant(tenantId);
  }
}
