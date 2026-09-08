import { Money } from '../src/money/money';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Money Value Object', () => {
  describe('Creation and Initialization', () => {
    it('should create money from minor units correctly', () => {
      const m = Money.fromMinor(1000n, 'USD');
      expect(m.amountMinor).toBe(1000n);
      expect(m.currency).toBe('USD');
    });

    it('should create money from decimal strings', () => {
      const m = Money.fromDecimal('10.50', 'USD');
      expect(m.amountMinor).toBe(1050n);
      expect(m.currency).toBe('USD');
    });

    it('should create money from numbers with correct rounding', () => {
      const m = Money.fromDecimal(99.99, 'EUR');
      expect(m.amountMinor).toBe(9999n);
      expect(m.currency).toBe('EUR');
    });

    it('should handle JPY zero decimal currency', () => {
      const m = Money.fromDecimal(500, 'JPY');
      expect(m.amountMinor).toBe(500n);
      expect(m.currency).toBe('JPY');
    });

    it('should create zero money', () => {
      const m = Money.zero('USD');
      expect(m.amountMinor).toBe(0n);
      expect(m.isZero()).toBe(true);
      expect(m.isPositive()).toBe(false);
      expect(m.isNegative()).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add money of the same currency', () => {
      const m1 = Money.fromMinor(1500n, 'USD');
      const m2 = Money.fromMinor(2500n, 'USD');
      const sum = m1.add(m2);
      expect(sum.amountMinor).toBe(4000n);
      expect(sum.currency).toBe('USD');
    });

    it('should throw CURRENCY_MISMATCH when adding different currencies', () => {
      const usd = Money.fromMinor(1000n, 'USD');
      const eur = Money.fromMinor(1000n, 'EUR');
      expect(() => usd.add(eur)).toThrow(DomainError);
      expect(() => usd.add(eur)).toThrow(expect.objectContaining({ code: ErrorCode.CURRENCY_MISMATCH }));
    });

    it('should subtract money of the same currency', () => {
      const m1 = Money.fromMinor(5000n, 'GBP');
      const m2 = Money.fromMinor(1200n, 'GBP');
      const diff = m1.subtract(m2);
      expect(diff.amountMinor).toBe(3800n);
    });

    it('should handle negative result upon subtraction', () => {
      const m1 = Money.fromMinor(1000n, 'USD');
      const m2 = Money.fromMinor(2000n, 'USD');
      const diff = m1.subtract(m2);
      expect(diff.amountMinor).toBe(-1000n);
      expect(diff.isNegative()).toBe(true);
    });

    it('should multiply by scalar integer', () => {
      const m = Money.fromMinor(1000n, 'USD');
      const result = m.multiply(3n);
      expect(result.amountMinor).toBe(3000n);
    });

    it('should multiply by float factor with rounding', () => {
      const m = Money.fromMinor(1000n, 'USD'); // $10.00
      const result = m.multiply(1.05); // +5%
      expect(result.amountMinor).toBe(1050n);
    });
  });

  describe('Prorated Allocation (Penny-perfect partitioning)', () => {
    it('should split $100 among 3 parties without losing a penny (33.34, 33.33, 33.33)', () => {
      const total = Money.fromMinor(10000n, 'USD');
      const split = total.allocate([1, 1, 1]);
      expect(split.length).toBe(3);
      const sum = split[0].add(split[1]).add(split[2]);
      expect(sum.amountMinor).toBe(10000n);
      expect(split[0].amountMinor).toBe(3334n);
      expect(split[1].amountMinor).toBe(3333n);
      expect(split[2].amountMinor).toBe(3333n);
    });

    it('should allocate proportional revenue splits exactly', () => {
      const total = Money.fromMinor(50000n, 'USD'); // $500.00
      const split = total.allocate([70, 20, 10]);
      expect(split[0].amountMinor).toBe(35000n); // $350.00
      expect(split[1].amountMinor).toBe(10000n); // $100.00
      expect(split[2].amountMinor).toBe(5000n);  // $50.00
    });
  });

  describe('Comparisons and Formatting', () => {
    it('should compare amounts accurately', () => {
      const m1 = Money.fromMinor(2000n, 'USD');
      const m2 = Money.fromMinor(1000n, 'USD');
      const m3 = Money.fromMinor(2000n, 'USD');

      expect(m1.isGreaterThan(m2)).toBe(true);
      expect(m2.isLessThan(m1)).toBe(true);
      expect(m1.isGreaterThanOrEqual(m3)).toBe(true);
      expect(m1.equals(m3)).toBe(true);
    });

    it('should format money with symbols and currency codes', () => {
      const usd = Money.fromMinor(125050n, 'USD');
      expect(usd.format()).toBe('$1250.50 USD');

      const eur = Money.fromMinor(500n, 'EUR');
      expect(eur.format()).toBe('€5.00 EUR');
    });

    it('should convert to decimal number', () => {
      const m = Money.fromMinor(12345n, 'USD');
      expect(m.toDecimal()).toBe(123.45);
    });

    it('should serialize to JSON properly', () => {
      const m = Money.fromMinor(5000n, 'SAR');
      const json = m.toJSON();
      expect(json).toEqual({
        amountMinor: '5000',
        currency: 'SAR'
      });
    });
  });
});
