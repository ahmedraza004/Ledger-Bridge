export interface CurrencyInfo {
  code: string;
  minorUnits: number;
  symbol: string;
  name: string;
}

export const CURRENCY_REGISTRY: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', minorUnits: 2, symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', minorUnits: 2, symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', minorUnits: 2, symbol: '£', name: 'British Pound' },
  SAR: { code: 'SAR', minorUnits: 2, symbol: '﷼', name: 'Saudi Riyal' },
  AED: { code: 'AED', minorUnits: 2, symbol: 'د.إ', name: 'UAE Dirham' },
  JPY: { code: 'JPY', minorUnits: 0, symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', minorUnits: 2, symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', minorUnits: 2, symbol: 'A$', name: 'Australian Dollar' },
  CHF: { code: 'CHF', minorUnits: 2, symbol: 'CHF', name: 'Swiss Franc' },
  SGD: { code: 'SGD', minorUnits: 2, symbol: 'S$', name: 'Singapore Dollar' }
};

export function getCurrencyInfo(code: string): CurrencyInfo {
  const upper = code.toUpperCase();
  if (CURRENCY_REGISTRY[upper]) {
    return CURRENCY_REGISTRY[upper];
  }
  return { code: upper, minorUnits: 2, symbol: upper, name: upper };
}
