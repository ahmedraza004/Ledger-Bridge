import * as crypto from 'crypto';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';
import { Money, PaymentQuote } from '@ledgerbridge/domain';
import {
  FxProvider,
  FxRateRequest,
  FxRateResponse,
  GuaranteedQuoteRequest,
  GuaranteedQuoteResponse
} from '@ledgerbridge/ports';

// Hardcoded fallback parity rates if offline or Frankfurter is unavailable
const STATIC_FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, SAR: 3.75, AED: 3.67, JPY: 152.5, CAD: 1.36, AUD: 1.52, USD: 1.0 },
  EUR: { USD: 1.087, GBP: 0.86, SAR: 4.08, AED: 3.99, JPY: 165.8, CAD: 1.48, AUD: 1.65, EUR: 1.0 },
  GBP: { USD: 1.265, EUR: 1.16, SAR: 4.74, AED: 4.64, JPY: 192.8, CAD: 1.72, AUD: 1.92, GBP: 1.0 },
  SAR: { USD: 0.267, EUR: 0.245, GBP: 0.211, AED: 0.979, SAR: 1.0 }
};

export class FrankfurterFxAdapter implements FxProvider {
  public readonly providerName = 'Frankfurter-ECB';
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(options?: { baseUrl?: string; timeoutMs?: number; maxRetries?: number }) {
    this.baseUrl = options?.baseUrl ?? 'https://api.frankfurter.dev/v1';
    this.timeoutMs = options?.timeoutMs ?? 3500;
    this.maxRetries = options?.maxRetries ?? 2;
  }

  public async getExchangeRate(request: FxRateRequest): Promise<FxRateResponse> {
    const from = request.fromCurrency.toUpperCase();
    const to = request.toCurrency.toUpperCase();

    if (from === to) {
      return {
        fromCurrency: from,
        toCurrency: to,
        rate: 1.0,
        provider: this.providerName,
        timestamp: new Date()
      };
    }

    try {
      const rate = await this.fetchWithRetry(from, to);
      return {
        fromCurrency: from,
        toCurrency: to,
        rate,
        provider: this.providerName,
        timestamp: new Date()
      };
    } catch (err: unknown) {
      // Use fallback matrix if external API fails
      const fallbackRate = STATIC_FALLBACK_RATES[from]?.[to];
      if (fallbackRate) {
        return {
          fromCurrency: from,
          toCurrency: to,
          rate: fallbackRate,
          provider: `${this.providerName}-Fallback`,
          timestamp: new Date()
        };
      }
      throw new DomainError(
        ErrorCode.PROVIDER_ERROR,
        `Frankfurter FX rate unavailable for ${from}/${to}: ${(err as Error)?.message || 'Unknown error'}`
      );
    }
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

  private async fetchWithRetry(from: string, to: string): Promise<number> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const url = `${this.baseUrl}/latest?from=${from}&to=${to}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = (await res.json()) as { rates?: Record<string, number> };
        const rate = data?.rates?.[to];
        if (typeof rate === 'number') {
          return rate;
        }
        throw new Error(`Rate for target ${to} not returned in payload`);
      } catch (err: unknown) {
        lastError = err as Error;
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise((res) => setTimeout(res, 100 * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('Failed to fetch FX rates');
  }
}
