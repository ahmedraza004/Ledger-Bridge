import { DomainError, ErrorCode } from '@ledgerbridge/shared';
import { Posting } from './posting';

export type LedgerEntryStatus = 'DRAFT' | 'COMMITTED' | 'REVERSED';

export interface LedgerEntryProps {
  id: string;
  tenantId: string;
  transactionDate: Date;
  description: string;
  correlationId?: string;
  postings: Posting[];
  status?: LedgerEntryStatus;
  createdAt?: Date;
}

export class LedgerEntry {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly transactionDate: Date;
  public readonly description: string;
  public readonly correlationId?: string;
  public readonly postings: readonly Posting[];
  private _status: LedgerEntryStatus;
  public readonly createdAt: Date;

  constructor(props: LedgerEntryProps) {
    if (!props.postings || props.postings.length < 2) {
      throw new DomainError(
        ErrorCode.LEDGER_UNBALANCED,
        'A ledger entry must contain at least 2 postings'
      );
    }

    this.validateBalance(props.postings);

    this.id = props.id;
    this.tenantId = props.tenantId;
    this.transactionDate = props.transactionDate;
    this.description = props.description;
    this.correlationId = props.correlationId;
    this.postings = Object.freeze([...props.postings]);
    this._status = props.status ?? 'COMMITTED';
    this.createdAt = props.createdAt ?? new Date();
  }

  public get status(): LedgerEntryStatus {
    return this._status;
  }

  public markReversed(): void {
    this._status = 'REVERSED';
  }

  private validateBalance(postings: Posting[]): void {
    // Group totals by currency
    const totalsByCurrency: Record<string, { debits: bigint; credits: bigint }> = {};

    for (const posting of postings) {
      const curr = posting.amount.currency;
      if (!totalsByCurrency[curr]) {
        totalsByCurrency[curr] = { debits: 0n, credits: 0n };
      }

      if (posting.isDebit()) {
        totalsByCurrency[curr].debits += posting.amount.amountMinor;
      } else {
        totalsByCurrency[curr].credits += posting.amount.amountMinor;
      }
    }

    for (const [curr, totals] of Object.entries(totalsByCurrency)) {
      if (totals.debits !== totals.credits) {
        throw new DomainError(
          ErrorCode.LEDGER_UNBALANCED,
          `Ledger entry is unbalanced for currency ${curr}: Total Debits (${totals.debits}) != Total Credits (${totals.credits})`
        );
      }
    }
  }
}
