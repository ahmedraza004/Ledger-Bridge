import { Money } from '../src/money/money';
import { getCurrencyInfo } from '../src/money/currency';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Money Mathematical Edge Cases & Precision Invariants', () => {
  describe('Currency Registry Info', () => {
    it('should return accurate minor units for standard currencies', () => {
      expect(getCurrencyInfo('USD').minorUnits).toBe(2);
      expect(getCurrencyInfo('EUR').minorUnits).toBe(2);
      expect(getCurrencyInfo('GBP').minorUnits).toBe(2);
      expect(getCurrencyInfo('SAR').minorUnits).toBe(2);
      expect(getCurrencyInfo('JPY').minorUnits).toBe(0);
    });

    it('should handle unlisted exotic currencies gracefully with default 2 minor units', () => {
      const info = getCurrencyInfo('XYZ');
      expect(info.code).toBe('XYZ');
      expect(info.minorUnits).toBe(2);
    });
  });

  describe('Extreme BigInt Range & Precision Math', () => {
    it('should handle trillion-dollar institutional volumes without 64-bit float precision loss', () => {
      // 1 Trillion USD = 100,000,000,000,000 cents
      const trillion = Money.fromMinor(100_000_000_000_000n, 'USD');
      const addCent = Money.fromMinor(1n, 'USD');
      const sum = trillion.add(addCent);

      expect(sum.amountMinor).toBe(100_000_000_000_001n);
      expect(sum.amountMinor.toString()).toBe('100000000000001');
    });

    it('should allocate among 10 unequal shares with exact penny preservation', () => {
      const pot = Money.fromMinor(100000n, 'USD'); // $1,000.00
      const ratios = [3, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // prime ratios
      const shares = pot.allocate(ratios);

      expect(shares.length).toBe(10);
      const totalAllocated = shares.reduce((acc, m) => acc.add(m), Money.zero('USD'));
      expect(totalAllocated.amountMinor).toBe(100000n);
    });

    it('should throw error if allocation ratios sum to non-positive number', () => {
      const pot = Money.fromMinor(1000n, 'USD');
      expect(() => pot.allocate([0, 0, 0])).toThrow(DomainError);
    });

    it('should correctly evaluate boundary comparisons', () => {
      const a = Money.fromMinor(100n, 'USD');
      const b = Money.fromMinor(100n, 'USD');
      const c = Money.fromMinor(101n, 'USD');

      expect(a.equals(b)).toBe(true);
      expect(a.isGreaterThanOrEqual(b)).toBe(true);
      expect(a.isLessThanOrEqual(b)).toBe(true);
      expect(c.isGreaterThan(a)).toBe(true);
      expect(a.isLessThan(c)).toBe(true);
    });

    it('should correctly format varied currency values', () => {
      const gbp = Money.fromMinor(45050n, 'GBP');
      expect(gbp.format()).toBe('£450.50 GBP');

      const sar = Money.fromMinor(120000n, 'SAR');
      expect(sar.format()).toBe('﷼1200.00 SAR');
    });
  });
});
