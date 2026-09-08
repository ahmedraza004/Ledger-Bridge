import { DomainError, ErrorCode, PostingDirection } from '@ledgerbridge/shared';
import { Money } from '../money/money';

export interface PostingProps {
  id?: string;
  ledgerEntryId?: string;
  accountId: string;
  amount: Money;
  direction: PostingDirection;
  sequence?: number;
}

export class Posting {
  public readonly id?: string;
  public readonly ledgerEntryId?: string;
  public readonly accountId: string;
  public readonly amount: Money;
  public readonly direction: PostingDirection;
  public readonly sequence: number;

  constructor(props: PostingProps) {
    if (props.amount.isZero() || props.amount.isNegative()) {
      throw new DomainError(
        ErrorCode.INVALID_AMOUNT,
        'Posting amount must be strictly positive and non-zero'
      );
    }
    this.id = props.id;
    this.ledgerEntryId = props.ledgerEntryId;
    this.accountId = props.accountId;
    this.amount = props.amount;
    this.direction = props.direction;
    this.sequence = props.sequence ?? 0;
    Object.freeze(this);
  }

  public isDebit(): boolean {
    return this.direction === 'DEBIT';
  }

  public isCredit(): boolean {
    return this.direction === 'CREDIT';
  }
}
