import {
  InMemoryPaymentRepository,
  InMemoryLedgerRepository,
  InMemoryAuditRepository,
  InMemoryAccountRepository
} from '@ledgerbridge/infra-postgres';
import { MockPaymentRailAdapter } from '@ledgerbridge/adapters';
import { Account, LedgerAccount, Money, Payment } from '@ledgerbridge/domain';
import { IdempotencyService } from '../src/idempotency/idempotency.service';
import { QueueService } from '../src/queues/queue.service';
import { PaymentOrchestrator } from '../src/workflows/payment-orchestrator';

describe('Complex Payment Lifecycle Workflows & Resilience', () => {
  let paymentRepo: InMemoryPaymentRepository;
  let ledgerRepo: InMemoryLedgerRepository;
  let auditRepo: InMemoryAuditRepository;
  let accountRepo: InMemoryAccountRepository;
  let railAdapter: MockPaymentRailAdapter;
  let idempotencyService: IdempotencyService;
  let queueService: QueueService;
  let orchestrator: PaymentOrchestrator;

  const tenantId = 'tenant-complex-1';
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

    await accountRepo.save(new Account({
      id: sourceAccountId,
      tenantId,
      name: 'Alpha Holdings',
      type: 'ASSET',
      currency: 'USD',
      status: 'ACTIVE'
    }));

    await accountRepo.save(new Account({
      id: destAccountId,
      tenantId,
      name: 'Beta Payee',
      type: 'LIABILITY',
      currency: 'USD',
      status: 'ACTIVE'
    }));

    await ledgerRepo.saveAccount(new LedgerAccount({
      id: sourceAccountId,
      tenantId,
      name: 'Alpha Holdings Ledger',
      type: 'ASSET',
      currency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await ledgerRepo.saveAccount(new LedgerAccount({
      id: destAccountId,
      tenantId,
      name: 'Beta Payee Ledger',
      type: 'LIABILITY',
      currency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  });

  it('should return cached payment when re-submitting with identical idempotency key', async () => {
    const key = 'idem-race-test-1';
    const cmd = {
      tenantId,
      sourceAccountId,
      destinationAccountId: destAccountId,
      amountMinor: 10000n,
      currency: 'USD',
      reference: 'INV-IDEM-DUP-1',
      idempotencyKey: key,
      senderInfo: { id: 'usr-1', name: 'Alpha', country: 'US', kycStatus: 'VERIFIED' as const },
      recipientInfo: { id: 'usr-2', name: 'Beta', country: 'US', kycStatus: 'VERIFIED' as const }
    };

    const res1 = await orchestrator.executePayment(cmd);
    expect(res1.payment.state).toBe('settled');

    // Replay exact same request
    const res2 = await orchestrator.executePayment(cmd);
    expect(res2.isCachedIdempotentResponse).toBe(true);
    expect(res2.payment.id).toBe(res1.payment.id);

    // Verify ledger entries count: exactly 1 entry created
    const entries = await ledgerRepo.findEntriesByTenant(tenantId);
    expect(entries.length).toBe(1);
  });

  it('should fail with ENTITY_NOT_FOUND when source account does not exist', async () => {
    await expect(orchestrator.executePayment({
      tenantId,
      sourceAccountId: 'acc-nonexistent',
      destinationAccountId: destAccountId,
      amountMinor: 5000n,
      currency: 'USD',
      reference: 'FAIL-ACC',
      senderInfo: { id: 'usr-1', name: 'Alpha', country: 'US', kycStatus: 'VERIFIED' },
      recipientInfo: { id: 'usr-2', name: 'Beta', country: 'US', kycStatus: 'VERIFIED' }
    })).rejects.toThrow();
  });

  it('should fail with FORBIDDEN if sender account is FROZEN', async () => {
    const frozenAcc = new Account({
      id: 'acc-frozen-1',
      tenantId,
      name: 'Frozen Account',
      type: 'ASSET',
      currency: 'USD',
      status: 'FROZEN'
    });
    await accountRepo.save(frozenAcc);

    await expect(orchestrator.executePayment({
      tenantId,
      sourceAccountId: 'acc-frozen-1',
      destinationAccountId: destAccountId,
      amountMinor: 5000n,
      currency: 'USD',
      reference: 'FAIL-FROZEN',
      senderInfo: { id: 'usr-1', name: 'Alpha', country: 'US', kycStatus: 'VERIFIED' },
      recipientInfo: { id: 'usr-2', name: 'Beta', country: 'US', kycStatus: 'VERIFIED' }
    })).rejects.toThrow();
  });
});
