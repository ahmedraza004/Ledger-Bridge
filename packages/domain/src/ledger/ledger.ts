import { LedgerAccount } from './account';
import { LedgerEntry } from './entry';
import { Posting } from './posting';
import { Money } from '../money/money';

export interface AccountBalance {
  accountId: string;
  accountName: string;
  currency: string;
  debitTotal: Money;
  creditTotal: Money;
  netBalance: Money;
  isDebitNormal: boolean;
}

export class DoubleEntryLedger {
  public static calculateAccountBalance(
    account: LedgerAccount,
    postings: Posting[]
  ): AccountBalance {
    let debits = 0n;
    let credits = 0n;

    for (const p of postings) {
      if (p.accountId === account.id) {
        if (p.isDebit()) {
          debits += p.amount.amountMinor;
        } else {
          credits += p.amount.amountMinor;
        }
      }
    }

    const netMinor = account.isDebitNormal() ? debits - credits : credits - debits;

    return {
      accountId: account.id,
      accountName: account.name,
      currency: account.currency,
      debitTotal: Money.fromMinor(debits, account.currency),
      creditTotal: Money.fromMinor(credits, account.currency),
      netBalance: Money.fromMinor(netMinor, account.currency),
      isDebitNormal: account.isDebitNormal()
    };
  }

  public static createTransferEntry(params: {
    id: string;
    tenantId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    amount: Money;
    description: string;
    correlationId?: string;
  }): LedgerEntry {
    // Standard asset transfer: Credit source asset, Debit destination asset
    const debitPosting = new Posting({
      accountId: params.destinationAccountId,
      amount: params.amount,
      direction: 'DEBIT',
      sequence: 1
    });

    const creditPosting = new Posting({
      accountId: params.sourceAccountId,
      amount: params.amount,
      direction: 'CREDIT',
      sequence: 2
    });

    return new LedgerEntry({
      id: params.id,
      tenantId: params.tenantId,
      transactionDate: new Date(),
      description: params.description,
      correlationId: params.correlationId,
      postings: [debitPosting, creditPosting]
    });
  }

  public static createFeeTransferEntry(params: {
    id: string;
    tenantId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    feeAccountId: string;
    principalAmount: Money;
    feeAmount: Money;
    description: string;
    correlationId?: string;
  }): LedgerEntry {
    const totalDeducted = params.principalAmount.add(params.feeAmount);

    const creditSource = new Posting({
      accountId: params.sourceAccountId,
      amount: totalDeducted,
      direction: 'CREDIT',
      sequence: 1
    });

    const debitDestination = new Posting({
      accountId: params.destinationAccountId,
      amount: params.principalAmount,
      direction: 'DEBIT',
      sequence: 2
    });

    const debitFee = new Posting({
      accountId: params.feeAccountId,
      amount: params.feeAmount,
      direction: 'DEBIT',
      sequence: 3
    });

    return new LedgerEntry({
      id: params.id,
      tenantId: params.tenantId,
      transactionDate: new Date(),
      description: params.description,
      correlationId: params.correlationId,
      postings: [creditSource, debitDestination, debitFee]
    });
  }
}
