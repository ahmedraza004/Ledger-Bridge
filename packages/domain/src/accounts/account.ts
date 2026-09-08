import { AccountStatus, AccountType, DomainError, ErrorCode } from '@ledgerbridge/shared';
import { Money } from '../money/money';

export interface AccountProps {
  id: string;
  tenantId: string;
  name: string;
  type: AccountType;
  currency: string;
  status?: AccountStatus;
  kycTier?: number;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly name: string;
  public readonly type: AccountType;
  public readonly currency: string;
  private _status: AccountStatus;
  public readonly kycTier: number;
  public readonly metadata: Record<string, unknown>;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.type = props.type;
    this.currency = props.currency.toUpperCase();
    this._status = props.status ?? 'ACTIVE';
    this.kycTier = props.kycTier ?? 1;
    this.metadata = props.metadata ?? {};
    this.createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get status(): AccountStatus {
    return this._status;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public freeze(): void {
    this._status = 'FROZEN';
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._status = 'ACTIVE';
    this._updatedAt = new Date();
  }

  public suspend(): void {
    this._status = 'SUSPENDED';
    this._updatedAt = new Date();
  }

  public close(): void {
    this._status = 'CLOSED';
    this._updatedAt = new Date();
  }

  public assertCanTransact(amount: Money): void {
    if (this._status !== 'ACTIVE') {
      throw new DomainError(
        ErrorCode.FORBIDDEN,
        `Account ${this.id} (${this.name}) is in ${this._status} status and cannot transact.`
      );
    }
    if (amount.currency !== this.currency) {
      throw new DomainError(
        ErrorCode.CURRENCY_MISMATCH,
        `Account currency (${this.currency}) does not match transaction currency (${amount.currency})`
      );
    }
  }
}
