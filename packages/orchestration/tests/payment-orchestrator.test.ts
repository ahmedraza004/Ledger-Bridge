import {
  InMemoryPaymentRepository,
  InMemoryLedgerRepository,
  InMemoryAuditRepository,
  InMemoryAccountRepository
} from '@ledgerbridge/infra-postgres';
import { MockPaymentRailAdapter } from '@ledgerbridge/adapters';
import { Account, LedgerAccount, Money } from '@ledgerbridge/domain';
import { IdempotencyService } from '../src/idempotency/idempotency.service';
import { QueueService } from '../src/queues/queue.service';
import { PaymentOrchestrator } from '../src/workflows/payment-orchestrator';

describe('Payment Orchestrator Integration Workflow', () => {
  let paymentRepo: InMemoryPaymentRepository;
  let ledgerRepo: InMemoryLedgerRepository;
  let auditRepo: InMemoryAuditRepository;
  let accountRepo: InMemoryAccountRepository;
  let railAdapter: MockPaymentRailAdapter;
  let idempotencyService: IdempotencyService;
  let queueService: QueueService;
  let orchestrator: PaymentOrchestrator;

  const tenantId = 'tenant-orchestrator-1';
  const sourceAccountId = 'acc-source-1';
  const destAccountId = 'acc-dest-1';

  beforeEach(async () => {
    paymentRepo = new InMemoryPaymentRepository();
    ledgerRepo = new InMemoryLedgerRepository();
    auditRepo = new InMemoryAuditRepository();
    accountRepo = new InMemoryAccountRepository();
    railAdapter = new MockPaymentRailAdapter();
    idempotencyService = new IdempotencyService();
    queueService = new QueueService();

    orchestrator = new PaymentOrchestrator(
      paymentRepo,
      ledgerRepo,
      auditRepo,
      accountRepo,
      railAdapter,
      idempotencyService,
      queueService
    );

    // Setup Accounts
    await accountRepo.save(new Account({
      id: sourceAccountId,
      tenantId,
      name: 'Corporate Sender',
      type: 'ASSET',
      currency: 'USD',
      status: 'ACTIVE',
      kycTier: 2
    }));

    await accountRepo.save(new Account({
      id: destAccountId,
      tenantId,
      name: 'Supplier Payee',
      type: 'LIABILITY',
      currency: 'USD',
      status: 'ACTIVE',
      kycTier: 2
    }));

    await ledgerRepo.saveAccount(new LedgerAccount({
      id: sourceAccountId,
      tenantId,
      name: 'Corporate Sender Ledger',
      type: 'ASSET',
      currency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await ledgerRepo.saveAccount(new LedgerAccount({
      id: destAccountId,
      tenantId,
      name: 'Supplier Payee Ledger',
      type: 'LIABILITY',
      currency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  it('should successfully execute payment from quote to double-entry commit to settlement', async () => {
    const result = await orchestrator.executePayment({
      tenantId,
      sourceAccountId,
      destinationAccountId: destAccountId,
      amountMinor: 50000n, // $500.00
      currency: 'USD',
      reference: 'INV-2026-99',
      idempotencyKey: 'idem-flow-1',
      senderInfo: {
        id: 'usr-alice',
        name: 'Alice Corp',
        country: 'US',
        kycStatus: 'VERIFIED',
        amlRiskScore: 10
      },
      recipientInfo: {
        id: 'usr-bob',
        name: 'Bob Supplier',
        country: 'GB',
        kycStatus: 'VERIFIED',
        amlRiskScore: 5
      }
    });

    expect(result.payment.state).toBe('settled');
    expect(result.payment.ledgerEntryId).toBeDefined();
    expect(result.payment.settlementRailTxId).toBeDefined();

    // Verify Ledger balance updated
    const senderBalance = await ledgerRepo.getAccountBalance(sourceAccountId);
    expect(senderBalance).not.toBeNull();

    // Verify Audit log written
    const audits = await auditRepo.findByEntity('PAYMENT', result.payment.id);
    expect(audits.length).toBeGreaterThanOrEqual(3);

    // Verify Queue jobs
    const jobs = queueService.getJobs('webhook-queue');
    expect(jobs.length).toBe(1);
  });

  it('should route high-value payments (> $10k) to MANUAL_REVIEW without executing ledger transfer', async () => {
    const result = await orchestrator.executePayment({
      tenantId,
      sourceAccountId,
      destinationAccountId: destAccountId,
      amountMinor: 1500000n, // $15,000.00
      currency: 'USD',
      reference: 'LARGE-TRANSFER-1',
      senderInfo: {
        id: 'usr-alice',
        name: 'Alice Corp',
        country: 'US',
        kycStatus: 'VERIFIED',
        amlRiskScore: 10
      },
      recipientInfo: {
        id: 'usr-bob',
        name: 'Bob Supplier',
        country: 'GB',
        kycStatus: 'VERIFIED',
        amlRiskScore: 5
      }
    });

    expect(result.requiresManualReview).toBe(true);
    expect(result.payment.state).toBe('validated');
    expect(result.payment.ledgerEntryId).toBeUndefined(); // Ledger is not touched until approved!

    const jobs = queueService.getJobs('compliance-review-queue');
    expect(jobs.length).toBe(1);
  });

  it('should immediately fail and block payments involving unverified participants or sanctions', async () => {
    const result = await orchestrator.executePayment({
      tenantId,
      sourceAccountId,
      destinationAccountId: destAccountId,
      amountMinor: 10000n,
      currency: 'USD',
      reference: 'BLOCK-TEST',
      senderInfo: {
        id: 'usr-unverified',
        name: 'Unknown User',
        country: 'US',
        kycStatus: 'UNVERIFIED'
      },
      recipientInfo: {
        id: 'usr-bob',
        name: 'Bob Supplier',
        country: 'GB',
        kycStatus: 'VERIFIED'
      }
    });

    expect(result.payment.state).toBe('failed');
    expect(result.validationReasons?.length).toBeGreaterThan(0);
    expect(result.payment.ledgerEntryId).toBeUndefined();
  });
});
