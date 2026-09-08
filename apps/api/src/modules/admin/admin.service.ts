import { Injectable } from '@nestjs/common';
import { TelemetryService } from '../../common/telemetry/telemetry.service';
import { PaymentsService } from '../payments/payments.service';
import { Account, LedgerAccount, Money, Payment, AuditRecord } from '@ledgerbridge/domain';

@Injectable()
export class AdminService {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly paymentsService: PaymentsService
  ) {}

  public async getHealth() {
    return {
      status: 'UP',
      service: 'LedgerBridge API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
      components: {
        database: 'CONNECTED',
        redis: 'CONNECTED',
        stateMachine: 'HEALTHY',
        fxProvider: 'AVAILABLE (Frankfurter-ECB / MockFallback)'
      }
    };
  }

  public async getMetrics() {
    return this.telemetry.getMetrics();
  }

  public async seedDatabase(tenantId: string = 'default-tenant') {
    const repos = this.paymentsService.repos;

    // 1. Seed 10 realistic accounts across asset, liability, revenue, equity
    const accountsData = [
      { id: 'acc-cust-1', name: 'Alice Corporate Treasury', type: 'ASSET' as const, curr: 'USD', tier: 2 },
      { id: 'acc-cust-2', name: 'Bob Logistics Europe', type: 'LIABILITY' as const, curr: 'EUR', tier: 2 },
      { id: 'acc-cust-3', name: 'Apex Capital Ltd', type: 'ASSET' as const, curr: 'USD', tier: 3 },
      { id: 'acc-cust-4', name: 'Falcon Gulf Trading', type: 'LIABILITY' as const, curr: 'SAR', tier: 2 },
      { id: 'acc-cust-5', name: 'Tokyo Tech Hub KK', type: 'LIABILITY' as const, curr: 'JPY', tier: 1 },
      { id: 'acc-settle-usd', name: 'LedgerBridge USD Settlement Pool', type: 'ASSET' as const, curr: 'USD', tier: 3 },
      { id: 'acc-settle-eur', name: 'LedgerBridge EUR Settlement Pool', type: 'ASSET' as const, curr: 'EUR', tier: 3 },
      { id: 'acc-rev-fee', name: 'LedgerBridge Fee Revenue', type: 'REVENUE' as const, curr: 'USD', tier: 3 },
      { id: 'acc-exp-rail', name: 'Payment Rail Processing Expense', type: 'EXPENSE' as const, curr: 'USD', tier: 3 },
      { id: 'acc-equity-cap', name: 'Founder Capital Reserve', type: 'EQUITY' as const, curr: 'USD', tier: 3 }
    ];

    for (const a of accountsData) {
      await repos.accounts.save(new Account({
        id: a.id,
        tenantId,
        name: a.name,
        type: a.type,
        currency: a.curr,
        status: 'ACTIVE',
        kycTier: a.tier
      }));

      await repos.ledger.saveAccount(new LedgerAccount({
        id: a.id,
        tenantId,
        name: `${a.name} Ledger`,
        type: a.type,
        currency: a.curr,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    // 2. Seed 20 realistic payments (5 pending/validated, 5 settled, 5 failed, 5 reversed)
    const paymentStates: Array<'validated' | 'settled' | 'failed' | 'reversed'> = [
      'settled', 'settled', 'settled', 'settled', 'settled',
      'validated', 'validated', 'validated', 'validated', 'validated',
      'failed', 'failed', 'failed', 'failed', 'failed',
      'reversed', 'reversed', 'reversed', 'reversed', 'reversed'
    ];

    for (let i = 0; i < paymentStates.length; i++) {
      const state = paymentStates[i];
      const amountVal = BigInt((i + 1) * 25000); // from $250.00 to $5,000.00
      const paymentId = `pay-seed-${i + 1}`;

      const payment = new Payment({
        id: paymentId,
        tenantId,
        sourceAmount: Money.fromMinor(amountVal, 'USD'),
        targetAmount: Money.fromMinor(amountVal, 'USD'),
        feeAmount: Money.fromMinor(amountVal / 500n, 'USD'),
        sender: { id: 'acc-cust-1', name: 'Alice Corporate Treasury', country: 'US', accountId: 'acc-cust-1', kycStatus: 'VERIFIED' },
        recipient: { id: 'acc-cust-3', name: 'Apex Capital Ltd', country: 'US', accountId: 'acc-cust-3', kycStatus: 'VERIFIED' },
        reference: `INV-SEED-${1000 + i}`,
        state: state,
        rejectionReason: state === 'failed' ? 'Restricted jurisdiction policy check failed' : state === 'reversed' ? 'Merchant refund request' : undefined,
        ledgerEntryId: state === 'settled' || state === 'reversed' ? `entry-seed-${i + 1}` : undefined,
        settlementRailTxId: state === 'settled' || state === 'reversed' ? `rail-seed-tx-${i + 1}` : undefined,
        createdAt: new Date(Date.now() - (20 - i) * 3600 * 1000)
      });

      await repos.payments.save(payment);

      // Audit log entry
      await repos.audit.append(new AuditRecord({
        id: `audit-seed-${i + 1}`,
        tenantId,
        actor: 'SeedScript',
        action: `PAYMENT_${state.toUpperCase()}`,
        entityType: 'PAYMENT',
        entityId: paymentId,
        afterState: { state, amount: payment.sourceAmount.format() }
      }));
    }

    return {
      message: 'Database seeded successfully',
      tenantId,
      accountsSeeded: accountsData.length,
      paymentsSeeded: paymentStates.length
    };
  }
}
