import { Money } from '../src/money/money';
import { LedgerAccount } from '../src/ledger/account';
import { Posting } from '../src/ledger/posting';
import { LedgerEntry } from '../src/ledger/entry';
import { DoubleEntryLedger } from '../src/ledger/ledger';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Double-Entry Ledger Engine', () => {
  const tenantId = 'tenant-test-123';
  const cashAccount = new LedgerAccount({
    id: 'acc-cash-1',
    tenantId,
    name: 'Operating Cash',
    type: 'ASSET',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const revenueAccount = new LedgerAccount({
    id: 'acc-rev-1',
    tenantId,
    name: 'Merchant Fees Revenue',
    type: 'REVENUE',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const liabilityAccount = new LedgerAccount({
    id: 'acc-liab-1',
    tenantId,
    name: 'Customer Deposits (Payables)',
    type: 'LIABILITY',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const feeExpenseAccount = new LedgerAccount({
    id: 'acc-exp-1',
    tenantId,
    name: 'Interchange Fee Expense',
    type: 'EXPENSE',
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  describe('Postings Validations', () => {
    it('should create valid debit and credit postings', () => {
      const p1 = new Posting({
        accountId: cashAccount.id,
        amount: Money.fromMinor(10000n, 'USD'),
        direction: 'DEBIT'
      });
      expect(p1.isDebit()).toBe(true);
      expect(p1.isCredit()).toBe(false);

      const p2 = new Posting({
        accountId: revenueAccount.id,
        amount: Money.fromMinor(10000n, 'USD'),
        direction: 'CREDIT'
      });
      expect(p2.isDebit()).toBe(false);
      expect(p2.isCredit()).toBe(true);
    });

    it('should reject posting with zero amount', () => {
      expect(() => {
        new Posting({
          accountId: cashAccount.id,
          amount: Money.zero('USD'),
          direction: 'DEBIT'
        });
      }).toThrow(DomainError);
    });

    it('should reject posting with negative amount', () => {
      expect(() => {
        new Posting({
          accountId: cashAccount.id,
          amount: Money.fromMinor(-500n, 'USD'),
          direction: 'DEBIT'
        });
      }).toThrow(DomainError);
    });
  });

  describe('Ledger Entry Invariants (Debits == Credits)', () => {
    it('should accept balanced entry where Debit 100 == Credit 100', () => {
      const entry = new LedgerEntry({
        id: 'entry-1',
        tenantId,
        transactionDate: new Date(),
        description: 'Customer deposit',
        postings: [
          new Posting({
            accountId: cashAccount.id,
            amount: Money.fromMinor(10000n, 'USD'),
            direction: 'DEBIT'
          }),
          new Posting({
            accountId: liabilityAccount.id,
            amount: Money.fromMinor(10000n, 'USD'),
            direction: 'CREDIT'
          })
        ]
      });

      expect(entry.id).toBe('entry-1');
      expect(entry.postings.length).toBe(2);
      expect(entry.status).toBe('COMMITTED');
    });

    it('should REJECT unbalanced entry (Debit 100, Credit 90)', () => {
      expect(() => {
        new LedgerEntry({
          id: 'entry-invalid-1',
          tenantId,
          transactionDate: new Date(),
          description: 'Unbalanced payment',
          postings: [
            new Posting({
              accountId: cashAccount.id,
              amount: Money.fromMinor(10000n, 'USD'), // $100
              direction: 'DEBIT'
            }),
            new Posting({
              accountId: revenueAccount.id,
              amount: Money.fromMinor(9000n, 'USD'), // $90
              direction: 'CREDIT'
            })
          ]
        });
      }).toThrow(DomainError);
    });

    it('should REJECT entry with fewer than 2 postings', () => {
      expect(() => {
        new LedgerEntry({
          id: 'entry-single',
          tenantId,
          transactionDate: new Date(),
          description: 'Single leg',
          postings: [
            new Posting({
              accountId: cashAccount.id,
              amount: Money.fromMinor(10000n, 'USD'),
              direction: 'DEBIT'
            })
          ]
        });
      }).toThrow(DomainError);
    });

    it('should accept multi-leg split transaction (1 Credit balanced by 2 Debits)', () => {
      // e.g. Customer pays $100: $98 credited to merchant, $2 credited to platform fee
      const entry = new LedgerEntry({
        id: 'entry-split',
        tenantId,
        transactionDate: new Date(),
        description: 'Payment split with fee',
        postings: [
          new Posting({
            accountId: cashAccount.id,
            amount: Money.fromMinor(10000n, 'USD'), // Debit Cash $100
            direction: 'DEBIT'
          }),
          new Posting({
            accountId: liabilityAccount.id,
            amount: Money.fromMinor(9800n, 'USD'), // Credit Merchant $98
            direction: 'CREDIT'
          }),
          new Posting({
            accountId: revenueAccount.id,
            amount: Money.fromMinor(200n, 'USD'), // Credit Revenue $2
            direction: 'CREDIT'
          })
        ]
      });

      expect(entry.postings.length).toBe(3);
    });

    it('should enforce balanced entries across multi-currency entries separately', () => {
      // 2 USD postings balanced AND 2 EUR postings balanced in same batch
      const entry = new LedgerEntry({
        id: 'entry-multi-curr',
        tenantId,
        transactionDate: new Date(),
        description: 'Multi-currency batch settlement',
        postings: [
          new Posting({
            accountId: 'acc-usd-1',
            amount: Money.fromMinor(5000n, 'USD'),
            direction: 'DEBIT'
          }),
          new Posting({
            accountId: 'acc-usd-2',
            amount: Money.fromMinor(5000n, 'USD'),
            direction: 'CREDIT'
          }),
          new Posting({
            accountId: 'acc-eur-1',
            amount: Money.fromMinor(4200n, 'EUR'),
            direction: 'DEBIT'
          }),
          new Posting({
            accountId: 'acc-eur-2',
            amount: Money.fromMinor(4200n, 'EUR'),
            direction: 'CREDIT'
          })
        ]
      });

      expect(entry.postings.length).toBe(4);
    });

    it('should reject cross-currency imbalance even if numerical totals match', () => {
      // Debit 100 USD, Credit 100 EUR is UNBALANCED
      expect(() => {
        new LedgerEntry({
          id: 'entry-cross-curr-imbalance',
          tenantId,
          transactionDate: new Date(),
          description: 'Invalid cross-currency entry',
          postings: [
            new Posting({
              accountId: 'acc-usd-1',
              amount: Money.fromMinor(10000n, 'USD'),
              direction: 'DEBIT'
            }),
            new Posting({
              accountId: 'acc-eur-1',
              amount: Money.fromMinor(10000n, 'EUR'),
              direction: 'CREDIT'
            })
          ]
        });
      }).toThrow(DomainError);
    });
  });

  describe('T-Account Balance Calculations', () => {
    it('should compute normal debit balance for Asset accounts', () => {
      const postings = [
        new Posting({
          accountId: cashAccount.id,
          amount: Money.fromMinor(50000n, 'USD'), // +$500 Debit
          direction: 'DEBIT'
        }),
        new Posting({
          accountId: cashAccount.id,
          amount: Money.fromMinor(12000n, 'USD'), // -$120 Credit
          direction: 'CREDIT'
        })
      ];

      const balance = DoubleEntryLedger.calculateAccountBalance(cashAccount, postings);
      expect(balance.debitTotal.amountMinor).toBe(50000n);
      expect(balance.creditTotal.amountMinor).toBe(12000n);
      expect(balance.netBalance.amountMinor).toBe(38000n); // Net $380
      expect(balance.isDebitNormal).toBe(true);
    });

    it('should compute normal credit balance for Revenue/Liability accounts', () => {
      const postings = [
        new Posting({
          accountId: revenueAccount.id,
          amount: Money.fromMinor(15000n, 'USD'),
          direction: 'CREDIT'
        }),
        new Posting({
          accountId: revenueAccount.id,
          amount: Money.fromMinor(2000n, 'USD'),
          direction: 'DEBIT'
        })
      ];

      const balance = DoubleEntryLedger.calculateAccountBalance(revenueAccount, postings);
      expect(balance.creditTotal.amountMinor).toBe(15000n);
      expect(balance.debitTotal.amountMinor).toBe(2000n);
      expect(balance.netBalance.amountMinor).toBe(13000n); // Net $130
      expect(balance.isDebitNormal).toBe(false);
    });
  });

  describe('Factory helpers', () => {
    it('should create simple transfer entry via helper', () => {
      const entry = DoubleEntryLedger.createTransferEntry({
        id: 'tx-1',
        tenantId,
        sourceAccountId: cashAccount.id,
        destinationAccountId: liabilityAccount.id,
        amount: Money.fromMinor(7500n, 'USD'),
        description: 'Internal transfer'
      });

      expect(entry.postings.length).toBe(2);
      expect(entry.postings[0].direction).toBe('DEBIT');
      expect(entry.postings[1].direction).toBe('CREDIT');
      expect(entry.postings[0].amount.amountMinor).toBe(7500n);
    });

    it('should create 3-legged fee transfer entry via helper', () => {
      const entry = DoubleEntryLedger.createFeeTransferEntry({
        id: 'tx-fee-1',
        tenantId,
        sourceAccountId: cashAccount.id,
        destinationAccountId: liabilityAccount.id,
        feeAccountId: revenueAccount.id,
        principalAmount: Money.fromMinor(10000n, 'USD'),
        feeAmount: Money.fromMinor(250n, 'USD'),
        description: 'Payout with platform fee'
      });

      expect(entry.postings.length).toBe(3);
      // Source credited $102.50
      expect(entry.postings[0].amount.amountMinor).toBe(10250n);
      expect(entry.postings[0].direction).toBe('CREDIT');
      // Destination debited $100.00
      expect(entry.postings[1].amount.amountMinor).toBe(10000n);
      expect(entry.postings[1].direction).toBe('DEBIT');
      // Fee debited $2.50
      expect(entry.postings[2].amount.amountMinor).toBe(250n);
      expect(entry.postings[2].direction).toBe('DEBIT');
    });
  });
});
