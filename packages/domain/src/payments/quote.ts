import { Money } from '../money/money';

export interface PaymentQuoteProps {
  id: string;
  tenantId: string;
  sourceAmount: Money;
  targetCurrency: string;
  exchangeRate: number; // e.g. 1.0850 (1 EUR = 1.085 USD)
  targetAmount: Money;
  feeAmount: Money;
  expiresAt: Date;
  createdAt: Date;
}

export class PaymentQuote {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly sourceAmount: Money;
  public readonly targetCurrency: string;
  public readonly exchangeRate: number;
  public readonly targetAmount: Money;
  public readonly feeAmount: Money;
  public readonly expiresAt: Date;
  public readonly createdAt: Date;

  constructor(props: PaymentQuoteProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.sourceAmount = props.sourceAmount;
    this.targetCurrency = props.targetCurrency.toUpperCase();
    this.exchangeRate = props.exchangeRate;
    this.targetAmount = props.targetAmount;
    this.feeAmount = props.feeAmount;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    Object.freeze(this);
  }

  public isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this.expiresAt.getTime();
  }

  public static create(params: {
    id: string;
    tenantId: string;
    sourceAmount: Money;
    targetCurrency: string;
    exchangeRate: number;
    feeBps?: number; // basis points (e.g. 25 bps = 0.25%)
    ttlSeconds?: number;
  }): PaymentQuote {
    const ttl = params.ttlSeconds ?? 60; // 60 seconds guaranteed rate
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const feeBps = params.feeBps ?? 20; // 0.2% fee
    const feeMinor = (params.sourceAmount.amountMinor * BigInt(feeBps)) / 10000n;
    const feeAmount = Money.fromMinor(feeMinor, params.sourceAmount.currency);

    const netSourceMinor = params.sourceAmount.amountMinor - feeMinor;
    const convertedMinor = BigInt(Math.round(Number(netSourceMinor) * params.exchangeRate));
    const targetAmount = Money.fromMinor(convertedMinor, params.targetCurrency);

    return new PaymentQuote({
      id: params.id,
      tenantId: params.tenantId,
      sourceAmount: params.sourceAmount,
      targetCurrency: params.targetCurrency,
      exchangeRate: params.exchangeRate,
      targetAmount,
      feeAmount,
      expiresAt,
      createdAt: now
    });
  }
}
