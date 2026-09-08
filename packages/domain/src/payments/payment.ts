import { DomainError, ErrorCode, PaymentState } from '@ledgerbridge/shared';
import { Money } from '../money/money';
import { PaymentStateMachine } from './state-machine';

export interface PaymentParticipant {
  id: string;
  name: string;
  country: string;
  accountId: string;
  kycStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
}

export interface PaymentProps {
  id: string;
  tenantId: string;
  sourceAmount: Money;
  targetAmount: Money;
  feeAmount: Money;
  sender: PaymentParticipant;
  recipient: PaymentParticipant;
  quoteId?: string;
  reference: string;
  state?: PaymentState;
  idempotencyKey?: string;
  rejectionReason?: string;
  ledgerEntryId?: string;
  settlementRailTxId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly sourceAmount: Money;
  public readonly targetAmount: Money;
  public readonly feeAmount: Money;
  public readonly sender: PaymentParticipant;
  public readonly recipient: PaymentParticipant;
  public readonly quoteId?: string;
  public readonly reference: string;
  private _state: PaymentState;
  public readonly idempotencyKey?: string;
  private _rejectionReason?: string;
  private _ledgerEntryId?: string;
  private _settlementRailTxId?: string;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PaymentProps) {
    if (props.sourceAmount.isZero() || props.sourceAmount.isNegative()) {
      throw new DomainError(ErrorCode.INVALID_AMOUNT, 'Payment source amount must be strictly positive');
    }

    this.id = props.id;
    this.tenantId = props.tenantId;
    this.sourceAmount = props.sourceAmount;
    this.targetAmount = props.targetAmount;
    this.feeAmount = props.feeAmount;
    this.sender = props.sender;
    this.recipient = props.recipient;
    this.quoteId = props.quoteId;
    this.reference = props.reference;
    this._state = props.state ?? 'quoted';
    this.idempotencyKey = props.idempotencyKey;
    this._rejectionReason = props.rejectionReason;
    this._ledgerEntryId = props.ledgerEntryId;
    this._settlementRailTxId = props.settlementRailTxId;
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get state(): PaymentState {
    return this._state;
  }

  public get rejectionReason(): string | undefined {
    return this._rejectionReason;
  }

  public get ledgerEntryId(): string | undefined {
    return this._ledgerEntryId;
  }

  public get settlementRailTxId(): string | undefined {
    return this._settlementRailTxId;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public transitionTo(newState: PaymentState, reason?: string): void {
    PaymentStateMachine.assertTransition(this._state, newState, this.id);
    this._state = newState;
    if (reason) {
      this._rejectionReason = reason;
    }
    this._updatedAt = new Date();
  }

  public linkLedgerEntry(entryId: string): void {
    this._ledgerEntryId = entryId;
    this._updatedAt = new Date();
  }

  public linkSettlementRail(railTxId: string): void {
    this._settlementRailTxId = railTxId;
    this._updatedAt = new Date();
  }
}
