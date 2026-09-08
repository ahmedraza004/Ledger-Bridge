import * as crypto from 'crypto';
import { Money, PaymentQuote } from '@ledgerbridge/domain';
import {
  FxProvider,
  FxRateRequest,
  FxRateResponse,
  GuaranteedQuoteRequest,
  GuaranteedQuoteResponse
} from '@ledgerbridge/ports';

export class MockFxAdapter implements FxProvider {
  public readonly providerName = 'MockFxProvider';
  private customRates: Record<string, number> = {
    'EUR/USD': 1.085,
    'USD/EUR': 0.921,
    'GBP/USD': 1.265,
    'USD/GBP': 0.79,
    'USD/SAR': 3.75,
    'SAR/USD': 0.267
  };

  public setRate(pair: string, rate: number): void {
    this.customRates[pair] = rate;
  }

  public async getExchangeRate(request: FxRateRequest): Promise<FxRateResponse> {
    const from = request.fromCurrency.toUpperCase();
    const to = request.toCurrency.toUpperCase();

    if (from === to) {
      return { fromCurrency: from, toCurrency: to, rate: 1.0, provider: this.providerName, timestamp: new Date() };
    }

    const pair = `${from}/${to}`;
    const rate = this.customRates[pair] ?? 1.25;

    return {
      fromCurrency: from,
      toCurrency: to,
      rate,
      provider: this.providerName,
      timestamp: new Date()
    };
  }

  public async getGuaranteedQuote(request: GuaranteedQuoteRequest): Promise<GuaranteedQuoteResponse> {
    const fx = await this.getExchangeRate({
      fromCurrency: request.sourceAmount.currency,
      toCurrency: request.targetCurrency
    });

    const quote = PaymentQuote.create({
      id: crypto.randomUUID(),
      tenantId: 'default',
      sourceAmount: request.sourceAmount,
      targetCurrency: request.targetCurrency,
      exchangeRate: fx.rate,
      ttlSeconds: request.ttlSeconds ?? 60
    });

    return {
      quoteId: quote.id,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      exchangeRate: quote.exchangeRate,
      feeAmount: quote.feeAmount,
      expiresAt: quote.expiresAt
    };
  }
}
