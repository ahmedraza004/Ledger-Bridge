import * as crypto from 'crypto';
import { DomainError, ErrorCode, PaymentState } from '@ledgerbridge/shared';
import {
  Payment,
  PaymentQuote,
  Money,
  PaymentValidationGate,
  DoubleEntryLedger,
  AuditRecord
} from '@ledgerbridge/domain';
import {
  PaymentRailProvider,
  AmlProvider,
  KycProvider,
  RegulatoryProvider
} from '@ledgerbridge/ports';
import {
  PaymentRepository,
  LedgerRepository,
  AuditRepository,
  AccountRepository
} from '@ledgerbridge/infra-postgres';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { QueueService } from '../queues/queue.service';

export interface ExecutePaymentCommand {
  tenantId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amountMinor: bigint;
  currency: string;
  targetCurrency?: string;
  quoteId?: string;
  reference: string;
  idempotencyKey?: string;
  senderInfo: {
    id: string;
    name: string;
    country: string;
    kycStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    amlRiskScore?: number;
  };
  recipientInfo: {
    id: string;
    name: string;
    country: string;
    kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
    amlRiskScore?: number;
  };
  correlationId?: string;
}

export interface PaymentExecutionResult {
  payment: Payment;
  isCachedIdempotentResponse?: boolean;
  requiresManualReview?: boolean;
  validationReasons?: string[];
}

export class PaymentOrchestrator {
  private readonly validationGate = new PaymentValidationGate();

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly ledgerRepo: LedgerRepository,
    private readonly auditRepo: AuditRepository,
    private readonly accountRepo: AccountRepository,
    private readonly railProvider: PaymentRailProvider,
    private readonly idempotencyService: IdempotencyService,
    private readonly queueService: QueueService
  ) {}

  public async executePayment(command: ExecutePaymentCommand): Promise<PaymentExecutionResult> {
    const correlationId = command.correlationId || crypto.randomUUID();

    // 1. Idempotency Check
    if (command.idempotencyKey) {
      const lockResult = await this.idempotencyService.acquireLock(
        command.idempotencyKey,
        command.tenantId,
        command
      );

      if (!lockResult.isNew && lockResult.record?.status === 'COMPLETED') {
        const cachedPayment = await this.paymentRepo.findByIdempotencyKey(command.idempotencyKey);
        if (cachedPayment) {
          return {
            payment: cachedPayment,
            isCachedIdempotentResponse: true
          };
        }
      }
    }

    try {
      // 2. Validate Accounts
      const sourceAccount = await this.accountRepo.findById(command.sourceAccountId);
      if (!sourceAccount) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, `Source account ${command.sourceAccountId} not found`);
      }
      const destAccount = await this.accountRepo.findById(command.destinationAccountId);
      if (!destAccount) {
        throw new DomainError(ErrorCode.ENTITY_NOT_FOUND, `Destination account ${command.destinationAccountId} not found`);
      }

      const sourceAmount = Money.fromMinor(command.amountMinor, command.currency);
      sourceAccount.assertCanTransact(sourceAmount);

      const targetCurrency = command.targetCurrency || command.currency;
      const targetAmount = Money.fromMinor(command.amountMinor, targetCurrency);
      const feeMinor = (command.amountMinor * 20n) / 10000n; // 0.2% fee
      const feeAmount = Money.fromMinor(feeMinor, command.currency);

      const paymentId = crypto.randomUUID();

      const payment = new Payment({
        id: paymentId,
        tenantId: command.tenantId,
        sourceAmount,
        targetAmount,
        feeAmount,
        sender: {
          id: command.senderInfo.id,
          name: command.senderInfo.name,
          country: command.senderInfo.country,
          accountId: command.sourceAccountId,
          kycStatus: command.senderInfo.kycStatus
        },
        recipient: {
          id: command.recipientInfo.id,
          name: command.recipientInfo.name,
          country: command.recipientInfo.country,
          accountId: command.destinationAccountId,
          kycStatus: command.recipientInfo.kycStatus
        },
        quoteId: command.quoteId,
        reference: command.reference,
        idempotencyKey: command.idempotencyKey,
        state: 'quoted'
      });

      // 3. Validation Gate
      const validationResult = await this.validationGate.validate({
        paymentId,
        tenantId: command.tenantId,
        amount: sourceAmount,
        sender: command.senderInfo,
        recipient: command.recipientInfo
      });

      if (validationResult.decision === 'DENY') {
        payment.transitionTo('failed', validationResult.reasons.join('; '));
        await this.paymentRepo.save(payment);
        await this.recordAudit(payment, 'PAYMENT_FAILED_RULES', correlationId);

        if (command.idempotencyKey) {
          await this.idempotencyService.saveResponse(command.idempotencyKey, command.tenantId, payment);
        }

        return {
          payment,
          validationReasons: validationResult.reasons
        };
      }

      // 4. Validated State Transition
      payment.transitionTo('validated');
      await this.paymentRepo.save(payment);
      await this.recordAudit(payment, 'PAYMENT_VALIDATED', correlationId);

      if (validationResult.decision === 'MANUAL_REVIEW') {
        // Enqueue background review notification
        await this.queueService.addJob('compliance-review-queue', 'manual-review-needed', {
          paymentId,
          reasons: validationResult.reasons
        });

        if (command.idempotencyKey) {
          await this.idempotencyService.saveResponse(command.idempotencyKey, command.tenantId, payment);
        }

        return {
          payment,
          requiresManualReview: true,
          validationReasons: validationResult.reasons
        };
      }

      // 5. Commit Double Entry Ledger Journal
      const ledgerEntryId = crypto.randomUUID();
      const ledgerEntry = DoubleEntryLedger.createTransferEntry({
        id: ledgerEntryId,
        tenantId: command.tenantId,
        sourceAccountId: command.sourceAccountId,
        destinationAccountId: command.destinationAccountId,
        amount: sourceAmount,
        description: `Payment ${paymentId}: ${command.reference}`,
        correlationId
      });

      await this.ledgerRepo.saveEntry(ledgerEntry);
      payment.linkLedgerEntry(ledgerEntryId);
      payment.transitionTo('committed');
      await this.paymentRepo.save(payment);
      await this.recordAudit(payment, 'PAYMENT_COMMITTED', correlationId);

      // 6. Submit to Payment Rails
      const railRes = await this.railProvider.submitPayout({
        paymentId,
        sourceAmount,
        targetAmount,
        senderName: command.senderInfo.name,
        recipientName: command.recipientInfo.name,
        recipientIbanOrAccountNumber: 'GB99TEST00000000000000',
        recipientBankCode: 'TESTGB2L',
        reference: command.reference
      });

      payment.linkSettlementRail(railRes.railTxId);
      payment.transitionTo('submitted');

      // 7. Settle Payment
      payment.transitionTo('settled');
      await this.paymentRepo.save(payment);
      await this.recordAudit(payment, 'PAYMENT_SETTLED', correlationId);

      // 8. Enqueue Async Outbox / Notifications
      await this.queueService.addJob('webhook-queue', 'payment.settled', {
        paymentId,
        tenantId: command.tenantId,
        state: 'settled',
        amount: sourceAmount.format()
      });

      if (command.idempotencyKey) {
        await this.idempotencyService.saveResponse(command.idempotencyKey, command.tenantId, payment);
      }

      return { payment };
    } catch (err) {
      if (command.idempotencyKey) {
        await this.idempotencyService.markFailed(command.idempotencyKey, command.tenantId);
      }
      throw err;
    }
  }

  private async recordAudit(payment: Payment, action: string, correlationId: string): Promise<void> {
    const latest = await this.auditRepo.getLatestRecord(payment.tenantId);
    const record = new AuditRecord({
      id: crypto.randomUUID(),
      tenantId: payment.tenantId,
      actor: 'PaymentOrchestrator',
      action,
      entityType: 'PAYMENT',
      entityId: payment.id,
      afterState: {
        state: payment.state,
        amount: payment.sourceAmount.format(),
        rejectionReason: payment.rejectionReason,
        railTxId: payment.settlementRailTxId
      },
      correlationId,
      previousHash: latest?.hash
    });

    await this.auditRepo.append(record);
  }
}
