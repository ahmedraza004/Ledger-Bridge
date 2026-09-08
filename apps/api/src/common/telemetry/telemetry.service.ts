import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class TelemetryService {
  public readonly registry: client.Registry;

  public readonly paymentsProcessedTotal: client.Counter;
  public readonly paymentsFailedTotal: client.Counter;
  public readonly fxRequestsTotal: client.Counter;
  public readonly amlEvaluationsTotal: client.Counter;
  public readonly quoteLatencyHistogram: client.Histogram;

  constructor() {
    this.registry = new client.Registry();
    client.collectDefaultMetrics({ register: this.registry });

    this.paymentsProcessedTotal = new client.Counter({
      name: 'ledgerbridge_payments_processed_total',
      help: 'Total count of settled payments processed',
      labelNames: ['tenant_id', 'currency'],
      registers: [this.registry]
    });

    this.paymentsFailedTotal = new client.Counter({
      name: 'ledgerbridge_payments_failed_total',
      help: 'Total count of payments failed due to rules or execution errors',
      labelNames: ['tenant_id', 'reason_code'],
      registers: [this.registry]
    });

    this.fxRequestsTotal = new client.Counter({
      name: 'ledgerbridge_fx_requests_total',
      help: 'Total count of FX quotes generated',
      labelNames: ['provider', 'from_currency', 'to_currency'],
      registers: [this.registry]
    });

    this.amlEvaluationsTotal = new client.Counter({
      name: 'ledgerbridge_aml_evaluations_total',
      help: 'Total count of AML rule checks executed',
      labelNames: ['decision'],
      registers: [this.registry]
    });

    this.quoteLatencyHistogram = new client.Histogram({
      name: 'ledgerbridge_quote_latency_seconds',
      help: 'Latency of FX quote calculation in seconds',
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
      registers: [this.registry]
    });
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
