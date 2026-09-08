import { Money } from '../src/money/money';
import { LedgerAccount } from '../src/ledger/account';
import { Posting } from '../src/ledger/posting';
import { LedgerEntry } from '../src/ledger/entry';
import { DoubleEntryLedger } from '../src/ledger/ledger';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Advanced Double-Entry Ledger Scenarios & Invariant Stress Tests', () => {
  const tenant1 = 'tenant-enterprise-1';
  const tenant2 = 'tenant-enterprise-2';

  const usdOperating = new LedgerAccount({
    id: 'acc-usd-op',
    tenantId: tenant1,
    name: 'USD Operating Cash',
    type: 'ASSET',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const usdLiab = new LedgerAccount({
    id: 'acc-usd-liab',
    tenantId: tenant1,
    name: 'Customer USD Wallet Balance',
    type: 'LIABILITY',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const eurOperating = new LedgerAccount({
    id: 'acc-eur-op',
    tenantId: tenant1,
    name: 'EUR Operating Cash',
    type: 'ASSET',
    currency: 'EUR',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const eurLiab = new LedgerAccount({
    id: 'acc-eur-liab',
    tenantId: tenant1,
    name: 'Customer EUR Wallet Balance',
    type: 'LIABILITY',
    currency: 'EUR',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const feeRevenue = new LedgerAccount({
    id: 'acc-fee-rev',
    tenantId: tenant1,
    name: 'FX Spread & Fee Revenue',
    type: 'REVENUE',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  describe('Multi-Currency FX Exchange Journal Entries (4-Legged Atomic Settlement)', () => {
    it('should balance a 4-legged FX conversion journal entry with fee deduction', () => {
      // Customer trades 1,000 USD to receive 918.00 EUR (at 0.92 rate with $2.00 fee)
      // Leg 1: Debit USD Customer Liab $1,000 (reduces USD liability)
      // Leg 2: Credit USD Operating Cash $998 (retains USD)
      // Leg 3: Credit USD Fee Revenue $2 (recognizes revenue) -> USD balanced: 1000 = 998 + 2
      // Leg 4: Credit EUR Operating Cash €918
      // Leg 5: Debit EUR Customer Liab €918 -> EUR balanced: 918 = 918

      const entry = new LedgerEntry({
        id: 'entry-fx-atomic-1',
        tenantId: tenant1,
        transactionDate: new Date(),
        description: 'Atomic FX Trade: USD -> EUR',
        postings: [
          new Posting({
            accountId: usdLiab.id,
            amount: Money.fromMinor(100000n, 'USD'),
            direction: 'DEBIT',
            sequence: 1
          }),
          new Posting({
            accountId: usdOperating.id,
            amount: Money.fromMinor(99800n, 'USD'),
            direction: 'CREDIT',
            sequence: 2
          }),
          new Posting({
            accountId: feeRevenue.id,
            amount: Money.fromMinor(200n, 'USD'),
            direction: 'CREDIT',
            sequence: 3
          }),
          new Posting({
            accountId: eurLiab.id,
            amount: Money.fromMinor(91800n, 'EUR'),
            direction: 'DEBIT',
            sequence: 4
          }),
          new Posting({
            accountId: eurOperating.id,
            amount: Money.fromMinor(91800n, 'EUR'),
            direction: 'CREDIT',
            sequence: 5
          })
        ]
      });

      expect(entry.postings.length).toBe(5);
      expect(entry.status).toBe('COMMITTED');
    });

    it('should reject 4-legged FX journal if USD legs balance but EUR legs are off by 1 cent', () => {
      expect(() => {
        new LedgerEntry({
          id: 'entry-fx-err',
          tenantId: tenant1,
          transactionDate: new Date(),
          description: 'Flawed FX Trade',
          postings: [
            new Posting({
              accountId: usdLiab.id,
              amount: Money.fromMinor(100000n, 'USD'),
              direction: 'DEBIT'
            }),
            new Posting({
              accountId: usdOperating.id,
              amount: Money.fromMinor(100000n, 'USD'),
              direction: 'CREDIT'
            }),
            new Posting({
              accountId: eurLiab.id,
              amount: Money.fromMinor(91800n, 'EUR'),
              direction: 'DEBIT'
            }),
            new Posting({
              accountId: eurOperating.id,
              amount: Money.fromMinor(91801n, 'EUR'), // 1 cent discrepancy!
              direction: 'CREDIT'
            })
          ]
        });
      }).toThrow(DomainError);
    });
  });

  describe('Complex Reversals and Chargebacks', () => {
    it('should accurately reverse a committed ledger entry with inverse postings', () => {
      const original = DoubleEntryLedger.createTransferEntry({
        id: 'tx-orig',
        tenantId: tenant1,
        sourceAccountId: usdOperating.id,
        destinationAccountId: usdLiab.id,
        amount: Money.fromMinor(25000n, 'USD'),
        description: 'Customer withdrawal'
      });

      const reversal = new LedgerEntry({
        id: 'tx-reversal',
        tenantId: tenant1,
        transactionDate: new Date(),
        description: `Reversal of ${original.id}: Failed bank payout`,
        postings: [
          new Posting({
            accountId: original.postings[0].accountId,
            amount: original.postings[0].amount,
            direction: original.postings[0].direction === 'DEBIT' ? 'CREDIT' : 'DEBIT'
          }),
          new Posting({
            accountId: original.postings[1].accountId,
            amount: original.postings[1].amount,
            direction: original.postings[1].direction === 'DEBIT' ? 'CREDIT' : 'DEBIT'
          })
        ]
      });

      expect(reversal.status).toBe('COMMITTED');

      // Net balance after both entries should return to 0
      const allPostings = [...original.postings, ...reversal.postings];
      const bal = DoubleEntryLedger.calculateAccountBalance(usdOperating, allPostings);
      expect(bal.netBalance.amountMinor).toBe(0n);
    });

    it('should calculate accurate account balances across 50 sequential ledger postings', () => {
      const postings: Posting[] = [];
      let expectedDebits = 0n;
      let expectedCredits = 0n;

      for (let i = 1; i <= 50; i++) {
        const amt = BigInt(i * 100);
        if (i % 2 === 0) {
          postings.push(new Posting({
            accountId: usdOperating.id,
            amount: Money.fromMinor(amt, 'USD'),
            direction: 'DEBIT',
            sequence: i
          }));
          expectedDebits += amt;
        } else {
          postings.push(new Posting({
            accountId: usdOperating.id,
            amount: Money.fromMinor(amt, 'USD'),
            direction: 'CREDIT',
            sequence: i
          }));
          expectedCredits += amt;
        }
      }

      const bal = DoubleEntryLedger.calculateAccountBalance(usdOperating, postings);
      expect(bal.debitTotal.amountMinor).toBe(expectedDebits);
      expect(bal.creditTotal.amountMinor).toBe(expectedCredits);
      expect(bal.netBalance.amountMinor).toBe(expectedDebits - expectedCredits);
    });
  });

  describe('Account Lifecycle & Frozen States', () => {
    it('should allow freezing, unfreezing, and suspending accounts', () => {
      const acc = new LedgerAccount({
        id: 'acc-state-test',
        tenantId: tenant1,
        name: 'Risk Monitored Account',
        type: 'ASSET',
        currency: 'USD',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      expect(acc.isActive()).toBe(true);

      acc.freeze();
      expect(acc.status).toBe('FROZEN');
      expect(acc.isActive()).toBe(false);

      acc.activate();
      expect(acc.status).toBe('ACTIVE');

      acc.suspend();
      expect(acc.status).toBe('SUSPENDED');
    });
  });
});
