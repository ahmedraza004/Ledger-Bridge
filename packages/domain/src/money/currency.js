"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENCY_REGISTRY = void 0;
exports.getCurrencyInfo = getCurrencyInfo;
exports.CURRENCY_REGISTRY = {
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
function getCurrencyInfo(code) {
    const upper = code.toUpperCase();
    if (exports.CURRENCY_REGISTRY[upper]) {
        return exports.CURRENCY_REGISTRY[upper];
    }
    return { code: upper, minorUnits: 2, symbol: upper, name: upper };
}
//# sourceMappingURL=currency.js.map