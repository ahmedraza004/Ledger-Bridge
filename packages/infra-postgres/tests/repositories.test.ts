import {
  LedgerAccount,
  LedgerEntry,
  Posting,
  Payment,
  PaymentQuote,
  AuditRecord,
  Account,
  Money
} from '@ledgerbridge/domain';
import {
  InMemoryLedgerRepository,
  InMemoryPaymentRepository,
  InMemoryAuditRepository,
  InMemoryAccountRepository
} from '../src';

describe('Clean Architecture Repository Implementations (In-Memory / Domain Mapping)', () => {
  const tenantId = 'tenant-persist-1';

  describe('LedgerRepository', () => {
    const repo = new InMemoryLedgerRepository();

    beforeEach(() => repo.clear());

    it('should save and find ledger accounts and compute balances', async () => {
      const acc = new LedgerAccount({
        id: 'acc-ledger-1',
        tenantId,
        name: 'Settlement Account',
        type: 'ASSET',
        currency: 'USD',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await repo.saveAccount(acc);
      const found = await repo.findAccountById(acc.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Settlement Account');

      const entry = new LedgerEntry({
        id: 'entry-test-1',
        tenantId,
        transactionDate: new Date(),
        description: 'Funding',
        postings: [
          new Posting({
            accountId: acc.id,
            amount: Money.fromMinor(10000n, 'USD'),
            direction: 'DEBIT'
          }),
          new Posting({
            accountId: 'acc-ledger-2',
            amount: Money.fromMinor(10000n, 'USD'),
            direction: 'CREDIT'
          })
        ]
      });

      await repo.saveEntry(entry);
      const balance = await repo.getAccountBalance(acc.id);
      expect(balance?.netBalance.amountMinor).toBe(10000n);
    });
  });

  describe('PaymentRepository', () => {
    const repo = new InMemoryPaymentRepository();

    beforeEach(() => repo.clear());

    it('should save, find by ID, and find by idempotency key', async () => {
      const payment = new Payment({
        id: 'pay-persist-1',
        tenantId,
        sourceAmount: Money.fromMinor(5000n, 'USD'),
        targetAmount: Money.fromMinor(5000n, 'USD'),
        feeAmount: Money.fromMinor(10n, 'USD'),
        sender: { id: 's1', name: 'Alice', country: 'US', accountId: 'acc-s1' },
        recipient: { id: 'r1', name: 'Bob', country: 'US', accountId: 'acc-r1' },
        reference: 'INV-100',
        idempotencyKey: 'idem-key-unique-123'
      });

      await repo.save(payment);

      const found = await repo.findById('pay-persist-1');
      expect(found).not.toBeNull();
      expect(found?.reference).toBe('INV-100');

      const byKey = await repo.findByIdempotencyKey('idem-key-unique-123');
      expect(byKey).not.toBeNull();
      expect(byKey?.id).toBe('pay-persist-1');
    });

    it('should count payments by tenant', async () => {
      const payment = new Payment({
        id: 'pay-persist-2',
        tenantId,
        sourceAmount: Money.fromMinor(1000n, 'USD'),
        targetAmount: Money.fromMinor(1000n, 'USD'),
        feeAmount: Money.zero('USD'),
        sender: { id: 's1', name: 'Alice', country: 'US', accountId: 'acc-s1' },
        recipient: { id: 'r1', name: 'Bob', country: 'US', accountId: 'acc-r1' },
        reference: 'INV-200'
      });

      await repo.save(payment);
      const count = await repo.countByTenant(tenantId);
      expect(count).toBe(1);
    });
  });

  describe('AuditRepository', () => {
    const repo = new InMemoryAuditRepository();

    beforeEach(() => repo.clear());

    it('should append audit records and query by correlationId and entity', async () => {
      const record = new AuditRecord({
        id: 'audit-log-1',
        tenantId,
        actor: 'admin@fintech.com',
        action: 'PAYMENT_STATE_CHANGED',
        entityType: 'PAYMENT',
        entityId: 'pay-persist-1',
        correlationId: 'corr-xyz-123',
        afterState: { state: 'settled' }
      });

      await repo.append(record);

      const byCorr = await repo.findByCorrelationId('corr-xyz-123');
      expect(byCorr.length).toBe(1);
      expect(byCorr[0].action).toBe('PAYMENT_STATE_CHANGED');

      const byEntity = await repo.findByEntity('PAYMENT', 'pay-persist-1');
      expect(byEntity.length).toBe(1);

      const latest = await repo.getLatestRecord(tenantId);
      expect(latest?.id).toBe('audit-log-1');
    });
  });

  describe('AccountRepository', () => {
    const repo = new InMemoryAccountRepository();

    beforeEach(() => repo.clear());

    it('should save and find accounts with KYC status', async () => {
      const account = new Account({
        id: 'acc-app-1',
        tenantId,
        name: 'Alice Treasury',
        type: 'ASSET',
        currency: 'USD',
        kycTier: 2
      });

      await repo.save(account);
      const found = await repo.findById('acc-app-1');
      expect(found).not.toBeNull();
      expect(found?.kycTier).toBe(2);
      expect(found?.isActive()).toBe(true);
    });
  });
});
