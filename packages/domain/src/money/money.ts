import { DomainError, ErrorCode, RawMoney } from '@ledgerbridge/shared';
import { getCurrencyInfo } from './currency';

export class Money {
  public readonly amountMinor: bigint;
  public readonly currency: string;

  private constructor(amountMinor: bigint, currency: string) {
    this.amountMinor = amountMinor;
    this.currency = currency.toUpperCase();
    Object.freeze(this);
  }

  public static fromMinor(amountMinor: bigint | number | string, currency: string): Money {
    const parsed = typeof amountMinor === 'bigint' ? amountMinor : BigInt(amountMinor);
    return new Money(parsed, currency);
  }

  public static fromDecimal(amountDecimal: number | string, currency: string): Money {
    const info = getCurrencyInfo(currency);
    const str = typeof amountDecimal === 'number' ? amountDecimal.toFixed(info.minorUnits) : amountDecimal;
    const parts = str.split('.');
    const integerPart = parts[0] || '0';
    let fractionPart = parts[1] || '';
    
    if (fractionPart.length > info.minorUnits) {
      fractionPart = fractionPart.slice(0, info.minorUnits);
    } else {
      fractionPart = fractionPart.padEnd(info.minorUnits, '0');
    }

    const minorStr = `${integerPart}${fractionPart}`.replace(/^0+(?=\d)/, '') || '0';
    return new Money(BigInt(minorStr), currency);
  }

  public static zero(currency: string): Money {
    return new Money(0n, currency);
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor + other.amountMinor, this.currency);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountMinor - other.amountMinor, this.currency);
  }

  public multiply(factor: number | bigint): Money {
    if (typeof factor === 'bigint') {
      return new Money(this.amountMinor * factor, this.currency);
    }
    const scaled = Math.round(Number(this.amountMinor) * factor);
    return new Money(BigInt(scaled), this.currency);
  }

  public allocate(ratios: number[]): Money[] {
    if (ratios.length === 0) {
      return [];
    }
    const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
    if (totalRatio <= 0) {
      throw new DomainError(ErrorCode.INVALID_AMOUNT, 'Allocation ratios must sum to a positive number');
    }

    let remainder = this.amountMinor;
    const results: Money[] = [];

    for (let i = 0; i < ratios.length; i++) {
      const share = (this.amountMinor * BigInt(Math.round(ratios[i] * 10000))) / BigInt(Math.round(totalRatio * 10000));
      results.push(new Money(share, this.currency));
      remainder -= share;
    }

    // Allocate leftover remainder cents sequentially to guarantee exact sum
    let i = 0;
    while (remainder > 0n) {
      const current = results[i % results.length];
      results[i % results.length] = new Money(current.amountMinor + 1n, this.currency);
      remainder -= 1n;
      i++;
    }
    while (remainder < 0n) {
      const current = results[i % results.length];
      results[i % results.length] = new Money(current.amountMinor - 1n, this.currency);
      remainder += 1n;
      i++;
    }

    return results;
  }

  public equals(other: Money): boolean {
    return this.currency === other.currency.toUpperCase() && this.amountMinor === other.amountMinor;
  }

  public compareTo(other: Money): number {
    this.assertSameCurrency(other);
    if (this.amountMinor > other.amountMinor) return 1;
    if (this.amountMinor < other.amountMinor) return -1;
    return 0;
  }

  public isGreaterThan(other: Money): boolean {
    return this.compareTo(other) > 0;
  }

  public isLessThan(other: Money): boolean {
    return this.compareTo(other) < 0;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    return this.compareTo(other) >= 0;
  }

  public isLessThanOrEqual(other: Money): boolean {
    return this.compareTo(other) <= 0;
  }

  public isZero(): boolean {
    return this.amountMinor === 0n;
  }

  public isPositive(): boolean {
    return this.amountMinor > 0n;
  }

  public isNegative(): boolean {
    return this.amountMinor < 0n;
  }

  public format(locale: string = 'en-US'): string {
    const info = getCurrencyInfo(this.currency);
    const divisor = BigInt(10 ** info.minorUnits);
    const whole = this.amountMinor / divisor;
    const fraction = (this.amountMinor % divisor).toString().padStart(info.minorUnits, '0');
    return `${info.symbol}${whole}.${fraction} ${this.currency}`;
  }

  public toDecimal(): number {
    const info = getCurrencyInfo(this.currency);
    return Number(this.amountMinor) / (10 ** info.minorUnits);
  }

  public toJSON(): RawMoney {
    return {
      amountMinor: this.amountMinor.toString(),
      currency: this.currency
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency.toUpperCase()) {
      throw new DomainError(
        ErrorCode.CURRENCY_MISMATCH,
        `Cannot perform arithmetic on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}
