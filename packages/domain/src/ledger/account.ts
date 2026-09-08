import { AccountStatus, AccountType } from '@ledgerbridge/shared';

export interface LedgerAccountProps {
  id: string;
  tenantId: string;
  name: string;
  type: AccountType;
  currency: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class LedgerAccount {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly name: string;
  public readonly type: AccountType;
  public readonly currency: string;
  private _status: AccountStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: LedgerAccountProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.type = props.type;
    this.currency = props.currency.toUpperCase();
    this._status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public get status(): AccountStatus {
    return this._status;
  }

  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public freeze(): void {
    this._status = 'FROZEN';
  }

  public activate(): void {
    this._status = 'ACTIVE';
  }

  public suspend(): void {
    this._status = 'SUSPENDED';
  }

  public isDebitNormal(): boolean {
    // Normal balance for Assets and Expenses is DEBIT; Liabilities, Equities, Revenue is CREDIT
    return this.type === 'ASSET' || this.type === 'EXPENSE';
  }
}
