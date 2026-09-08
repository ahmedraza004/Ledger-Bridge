import { RuleEngine, Rule, RuleResult } from '../src/rules/rule-engine';
import { KycRule } from '../src/rules/kyc-rule';
import { AmlRule } from '../src/rules/aml-rule';
import { CountryRule } from '../src/rules/country-rule';
import { AmountThresholdRule } from '../src/rules/threshold-rule';
import { VelocityRule } from '../src/rules/velocity-rule';
import { Money } from '../src/money/money';

describe('Rule Engine Dynamic Composition & Multi-Tier Evaluations', () => {
  it('should evaluate custom dynamic rule registration', async () => {
    const engine = new RuleEngine<{ isVIP: boolean; tradeLimit: number }>();

    const customVipRule: Rule<{ isVIP: boolean; tradeLimit: number }> = {
      name: 'CUSTOM_VIP_RULE',
      evaluate: (ctx) => {
        if (!ctx.isVIP && ctx.tradeLimit > 50000) {
          return {
            ruleName: 'CUSTOM_VIP_RULE',
            passed: false,
            decision: 'DENY',
            reason: 'Non-VIP traders are capped at 50,000 limit'
          };
        }
        return {
          ruleName: 'CUSTOM_VIP_RULE',
          passed: true,
          decision: 'ALLOW'
        };
      }
    };

    engine.register(customVipRule);

    const allowRes = await engine.evaluateAll({ isVIP: true, tradeLimit: 100000 });
    expect(allowRes.finalDecision).toBe('ALLOW');

    const denyRes = await engine.evaluateAll({ isVIP: false, tradeLimit: 75000 });
    expect(denyRes.finalDecision).toBe('DENY');
    expect(denyRes.results[0].reason).toContain('Non-VIP traders');
  });

  it('should prioritize DENY over MANUAL_REVIEW when multiple rules trigger', async () => {
    const engine = new RuleEngine<any>();

    const reviewRule: Rule<any> = {
      name: 'REVIEW_RULE',
      evaluate: () => ({ ruleName: 'REVIEW_RULE', passed: false, decision: 'MANUAL_REVIEW' })
    };

    const denyRule: Rule<any> = {
      name: 'DENY_RULE',
      evaluate: () => ({ ruleName: 'DENY_RULE', passed: false, decision: 'DENY' })
    };

    engine.register(reviewRule).register(denyRule);

    const res = await engine.evaluateAll({});
    expect(res.finalDecision).toBe('DENY');
    expect(res.results.length).toBe(2);
  });

  it('should correctly evaluate clean Allow across chained standard rules', async () => {
    const kyc = new KycRule();
    const aml = new AmlRule();
    const country = new CountryRule();
    const threshold = new AmountThresholdRule();
    const velocity = new VelocityRule();

    const r1 = kyc.evaluate({ sender: { id: 'u1', kycStatus: 'VERIFIED' } });
    const r2 = aml.evaluate({ senderAmlRiskScore: 5 });
    const r3 = country.evaluate({ senderCountry: 'US', recipientCountry: 'DE' });
    const r4 = threshold.evaluate({ amount: Money.fromMinor(1000n, 'USD') });
    const r5 = velocity.evaluate({ senderRecentTxCountLastHour: 2, senderRecentVolumeMinorLastHour: 1000n });

    expect([r1, r2, r3, r4, r5].every(r => r.decision === 'ALLOW')).toBe(true);
  });

  it('KYC Rule: should handle missing recipient gracefully', () => {
    const kyc = new KycRule();
    const res = kyc.evaluate({ sender: { id: 'u1', kycStatus: 'VERIFIED' } });
    expect(res.decision).toBe('ALLOW');
    expect(res.passed).toBe(true);
  });

  it('AML Rule: should flag adverse media on clean PEP with manual review', () => {
    const aml = new AmlRule();
    const res = aml.evaluate({ senderAmlRiskScore: 62, isPoliticallyExposed: true });
    expect(res.decision).toBe('MANUAL_REVIEW');
    expect(res.passed).toBe(false);
  });

  it('Threshold Rule: should handle custom threshold limits', () => {
    const threshold = new AmountThresholdRule(500_000n); // $5,000 threshold
    const res = threshold.evaluate({ amount: Money.fromMinor(600_000n, 'USD') });
    expect(res.decision).toBe('MANUAL_REVIEW');
  });

  it('Country Rule: should handle lowercase country codes properly', () => {
    const country = new CountryRule();
    const res = country.evaluate({ senderCountry: 'us', recipientCountry: 'ir' });
    expect(res.decision).toBe('DENY');
  });

  it('Velocity Rule: should flag warning manual review at 75% threshold', () => {
    const velocity = new VelocityRule(20); // 20 tx/hr limit
    const res = velocity.evaluate({ senderRecentTxCountLastHour: 16, senderRecentVolumeMinorLastHour: 50000n });
    expect(res.decision).toBe('MANUAL_REVIEW');
  });

  it('RuleEngine: should return empty results when no rules registered', async () => {
    const engine = new RuleEngine<any>();
    const res = await engine.evaluateAll({});
    expect(res.finalDecision).toBe('ALLOW');
    expect(res.results.length).toBe(0);
  });

  it('RuleEngine: should evaluate async rules seamlessly', async () => {
    const engine = new RuleEngine<any>();
    engine.register({
      name: 'ASYNC_PROMISE_RULE',
      evaluate: async () => {
        await new Promise(r => setTimeout(r, 10));
        return { ruleName: 'ASYNC_PROMISE_RULE', passed: true, decision: 'ALLOW' };
      }
    });

    const res = await engine.evaluateAll({});
    expect(res.finalDecision).toBe('ALLOW');
  });

  it('Threshold Rule: should ignore EUR without USD equivalent provided', () => {
    const threshold = new AmountThresholdRule();
    const res = threshold.evaluate({ amount: Money.fromMinor(5000000n, 'EUR') });
    expect(res.decision).toBe('ALLOW');
  });

  it('Threshold Rule: should evaluate threshold against USD equivalent when provided for EUR', () => {
    const threshold = new AmountThresholdRule();
    const res = threshold.evaluate({
      amount: Money.fromMinor(5000000n, 'EUR'),
      thresholdEquivalentUsd: Money.fromMinor(5450000n, 'USD') // $54,500 USD
    });
    expect(res.decision).toBe('MANUAL_REVIEW');
  });

  it('AML Rule: should prioritize sanctions over PEP status', () => {
    const aml = new AmlRule();
    const res = aml.evaluate({
      senderIsSanctioned: true,
      isPoliticallyExposed: true,
      senderAmlRiskScore: 99
    });
    expect(res.decision).toBe('DENY');
  });

  it('Country Rule: should allow intra-European transfers (FR -> DE)', () => {
    const country = new CountryRule();
    const res = country.evaluate({ senderCountry: 'FR', recipientCountry: 'DE' });
    expect(res.decision).toBe('ALLOW');
  });

  it('Velocity Rule: should allow exactly at threshold boundary', () => {
    const velocity = new VelocityRule(10);
    const res = velocity.evaluate({ senderRecentTxCountLastHour: 5, senderRecentVolumeMinorLastHour: 1000n });
    expect(res.decision).toBe('ALLOW');
  });
});
