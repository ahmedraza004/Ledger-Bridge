import { RawMoney } from '@ledgerbridge/shared';
export declare class Money {
    readonly amountMinor: bigint;
    readonly currency: string;
    private constructor();
    static fromMinor(amountMinor: bigint | number | string, currency: string): Money;
    static fromDecimal(amountDecimal: number | string, currency: string): Money;
    static zero(currency: string): Money;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number | bigint): Money;
    allocate(ratios: number[]): Money[];
    equals(other: Money): boolean;
    compareTo(other: Money): number;
    isGreaterThan(other: Money): boolean;
    isLessThan(other: Money): boolean;
    isGreaterThanOrEqual(other: Money): boolean;
    isLessThanOrEqual(other: Money): boolean;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    format(locale?: string): string;
    toDecimal(): number;
    toJSON(): RawMoney;
    private assertSameCurrency;
}
//# sourceMappingURL=money.d.ts.map