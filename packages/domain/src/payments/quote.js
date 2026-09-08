"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentQuote = void 0;
const money_1 = require("../money/money");
class PaymentQuote {
    id;
    tenantId;
    sourceAmount;
    targetCurrency;
    exchangeRate;
    targetAmount;
    feeAmount;
    expiresAt;
    createdAt;
    constructor(props) {
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
    isExpired(now = new Date()) {
        return now.getTime() > this.expiresAt.getTime();
    }
    static create(params) {
        const ttl = params.ttlSeconds ?? 60; // 60 seconds guaranteed rate
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttl * 1000);
        const feeBps = params.feeBps ?? 20; // 0.2% fee
        const feeMinor = (params.sourceAmount.amountMinor * BigInt(feeBps)) / 10000n;
        const feeAmount = money_1.Money.fromMinor(feeMinor, params.sourceAmount.currency);
        const netSourceMinor = params.sourceAmount.amountMinor - feeMinor;
        const convertedMinor = BigInt(Math.round(Number(netSourceMinor) * params.exchangeRate));
        const targetAmount = money_1.Money.fromMinor(convertedMinor, params.targetCurrency);
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
exports.PaymentQuote = PaymentQuote;
//# sourceMappingURL=quote.js.map