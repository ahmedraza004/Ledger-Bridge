export interface CurrencyInfo {
    code: string;
    minorUnits: number;
    symbol: string;
    name: string;
}
export declare const CURRENCY_REGISTRY: Record<string, CurrencyInfo>;
export declare function getCurrencyInfo(code: string): CurrencyInfo;
//# sourceMappingURL=currency.d.ts.map