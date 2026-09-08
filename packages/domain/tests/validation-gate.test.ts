import { Money } from '../src/money/money';
import { PaymentValidationGate } from '../src/payments/validation-gate';

describe('Payment Validation Gate', () => {
  const gate = new PaymentValidationGate();

  it('should return ALLOW for a fully compliant transaction', async () => {
    const res = await gate.validate({
      paymentId: 'pay-test-1',
      tenantId: 'tenant-1',
      amount: Money.fromMinor(50000n, 'USD'), // $500
      sender: {
        id: 'usr-1',
        name: 'Alice Corp',
        country: 'US',
        kycStatus: 'VERIFIED',
        amlRiskScore: 10,
        isPoliticallyExposed: false,
        recentTxCountLastHour: 2
      },
      recipient: {
        id: 'usr-2',
        name: 'Bob Ltd',
        country: 'GB',
        kycStatus: 'VERIFIED',
        amlRiskScore: 5,
        isSanctioned: false
      }
    });

    expect(res.decision).toBe('ALLOW');
    expect(res.reasons.length).toBe(0);
    expect(res.ruleResults.length).toBe(5);
  });

  it('should return DENY if any blocking rule fails (e.g. unverified sender or blocked country)', async () => {
    const res = await gate.validate({
      paymentId: 'pay-test-2',
      tenantId: 'tenant-1',
      amount: Money.fromMinor(10000n, 'USD'),
      sender: {
        id: 'usr-unverified',
        name: 'Unknown Sender',
        country: 'US',
        kycStatus: 'UNVERIFIED'
      },
      recipient: {
        id: 'usr-2',
        name: 'Bob Ltd',
        country: 'GB',
        kycStatus: 'VERIFIED'
      }
    });

    expect(res.decision).toBe('DENY');
    expect(res.reasons.length).toBeGreaterThan(0);
  });

  it('should return MANUAL_REVIEW for high value transactions over $10k', async () => {
    const res = await gate.validate({
      paymentId: 'pay-test-3',
      tenantId: 'tenant-1',
      amount: Money.fromMinor(2500000n, 'USD'), // $25,000.00
      sender: {
        id: 'usr-1',
        name: 'Alice Corp',
        country: 'US',
        kycStatus: 'VERIFIED',
        amlRiskScore: 15
      },
      recipient: {
        id: 'usr-2',
        name: 'Bob Ltd',
        country: 'GB',
        kycStatus: 'VERIFIED'
      }
    });

    expect(res.decision).toBe('MANUAL_REVIEW');
    expect(res.reasons.some(r => r.includes('$10,000.00'))).toBe(true);
  });
});
