"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const shared_1 = require("@ledgerbridge/shared");
const currency_1 = require("./currency");
class Money {
    amountMinor;
    currency;
    constructor(amountMinor, currency) {
        this.amountMinor = amountMinor;
        this.currency = currency.toUpperCase();
        Object.freeze(this);
    }
    static fromMinor(amountMinor, currency) {
        const parsed = typeof amountMinor === 'bigint' ? amountMinor : BigInt(amountMinor);
        return new Money(parsed, currency);
    }
    static fromDecimal(amountDecimal, currency) {
        const info = (0, currency_1.getCurrencyInfo)(currency);
        const str = typeof amountDecimal === 'number' ? amountDecimal.toFixed(info.minorUnits) : amountDecimal;
        const parts = str.split('.');
        const integerPart = parts[0] || '0';
        let fractionPart = parts[1] || '';
        if (fractionPart.length > info.minorUnits) {
            fractionPart = fractionPart.slice(0, info.minorUnits);
        }
        else {
            fractionPart = fractionPart.padEnd(info.minorUnits, '0');
        }
        const minorStr = `${integerPart}${fractionPart}`.replace(/^0+(?=\d)/, '') || '0';
        return new Money(BigInt(minorStr), currency);
    }
    static zero(currency) {
        return new Money(0n, currency);
    }
    add(other) {
        this.assertSameCurrency(other);
        return new Money(this.amountMinor + other.amountMinor, this.currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        return new Money(this.amountMinor - other.amountMinor, this.currency);
    }
    multiply(factor) {
        if (typeof factor === 'bigint') {
            return new Money(this.amountMinor * factor, this.currency);
        }
        const scaled = Math.round(Number(this.amountMinor) * factor);
        return new Money(BigInt(scaled), this.currency);
    }
    allocate(ratios) {
        if (ratios.length === 0) {
            return [];
        }
        const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
        if (totalRatio <= 0) {
            throw new shared_1.DomainError(shared_1.ErrorCode.INVALID_AMOUNT, 'Allocation ratios must sum to a positive number');
        }
        let remainder = this.amountMinor;
        const results = [];
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
    equals(other) {
        return this.currency === other.currency.toUpperCase() && this.amountMinor === other.amountMinor;
    }
    compareTo(other) {
        this.assertSameCurrency(other);
        if (this.amountMinor > other.amountMinor)
            return 1;
        if (this.amountMinor < other.amountMinor)
            return -1;
        return 0;
    }
    isGreaterThan(other) {
        return this.compareTo(other) > 0;
    }
    isLessThan(other) {
        return this.compareTo(other) < 0;
    }
    isGreaterThanOrEqual(other) {
        return this.compareTo(other) >= 0;
    }
    isLessThanOrEqual(other) {
        return this.compareTo(other) <= 0;
    }
    isZero() {
        return this.amountMinor === 0n;
    }
    isPositive() {
        return this.amountMinor > 0n;
    }
    isNegative() {
        return this.amountMinor < 0n;
    }
    format(locale = 'en-US') {
        const info = (0, currency_1.getCurrencyInfo)(this.currency);
        const divisor = BigInt(10 ** info.minorUnits);
        const whole = this.amountMinor / divisor;
        const fraction = (this.amountMinor % divisor).toString().padStart(info.minorUnits, '0');
        return `${info.symbol}${whole}.${fraction} ${this.currency}`;
    }
    toDecimal() {
        const info = (0, currency_1.getCurrencyInfo)(this.currency);
        return Number(this.amountMinor) / (10 ** info.minorUnits);
    }
    toJSON() {
        return {
            amountMinor: this.amountMinor.toString(),
            currency: this.currency
        };
    }
    assertSameCurrency(other) {
        if (this.currency !== other.currency.toUpperCase()) {
            throw new shared_1.DomainError(shared_1.ErrorCode.CURRENCY_MISMATCH, `Cannot perform arithmetic on different currencies: ${this.currency} and ${other.currency}`);
        }
    }
}
exports.Money = Money;
//# sourceMappingURL=money.js.map