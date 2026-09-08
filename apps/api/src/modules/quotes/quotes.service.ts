import { Injectable } from '@nestjs/common';
import { Money, PaymentQuote } from '@ledgerbridge/domain';
import { FrankfurterFxAdapter, MockFxAdapter } from '@ledgerbridge/adapters';
import { CreateQuoteDto } from '@ledgerbridge/shared';
import { TelemetryService } from '../../common/telemetry/telemetry.service';

@Injectable()
export class QuotesService {
  private readonly frankfurter = new FrankfurterFxAdapter();
  private readonly mockFx = new MockFxAdapter();
  private readonly quotes = new Map<string, PaymentQuote>();

  constructor(private readonly telemetry: TelemetryService) {}

  public async createQuote(dto: CreateQuoteDto): Promise<PaymentQuote> {
    const endTimer = this.telemetry.quoteLatencyHistogram.startTimer();
    try {
      const sourceAmount = Money.fromMinor(dto.sourceAmountMinor, dto.sourceCurrency);
      let rate = 1.0;

      if (dto.sourceCurrency !== dto.targetCurrency) {
        try {
          const fxRes = await this.frankfurter.getExchangeRate({
            fromCurrency: dto.sourceCurrency,
            toCurrency: dto.targetCurrency
          });
          rate = fxRes.rate;
        } catch {
          const mockRes = await this.mockFx.getExchangeRate({
            fromCurrency: dto.sourceCurrency,
            toCurrency: dto.targetCurrency
          });
          rate = mockRes.rate;
        }
      }

      this.telemetry.fxRequestsTotal.inc({
        provider: 'Frankfurter-ECB',
        from_currency: dto.sourceCurrency,
        to_currency: dto.targetCurrency
      });

      const quote = PaymentQuote.create({
        id: crypto.randomUUID(),
        tenantId: dto.tenantId,
        sourceAmount,
        targetCurrency: dto.targetCurrency,
        exchangeRate: rate,
        ttlSeconds: 90
      });

      this.quotes.set(quote.id, quote);
      return quote;
    } finally {
      endTimer();
    }
  }

  public getQuote(id: string): PaymentQuote | null {
    return this.quotes.get(id) || null;
  }
}
