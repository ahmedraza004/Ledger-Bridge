import { Money } from '../src/money/money';
import { KycRule } from '../src/rules/kyc-rule';
import { AmlRule } from '../src/rules/aml-rule';
import { AmountThresholdRule } from '../src/rules/threshold-rule';
import { CountryRule } from '../src/rules/country-rule';
import { VelocityRule } from '../src/rules/velocity-rule';

describe('Compliance Rule Engine', () => {
  describe('KYC Rule', () => {
    const kycRule = new KycRule();

    it('should ALLOW when sender is verified', () => {
      const res = kycRule.evaluate({
        sender: { id: 'usr-1', kycStatus: 'VERIFIED' },
        recipient: { id: 'usr-2', kycStatus: 'VERIFIED' }
      });
      expect(res.decision).toBe('ALLOW');
      expect(res.passed).toBe(true);
    });

    it('should DENY when sender is unverified', () => {
      const res = kycRule.evaluate({
        sender: { id: 'usr-1', kycStatus: 'UNVERIFIED' }
      });
      expect(res.decision).toBe('DENY');
      expect(res.passed).toBe(false);
    });

    it('should require MANUAL_REVIEW when recipient is unverified', () => {
      const res = kycRule.evaluate({
        sender: { id: 'usr-1', kycStatus: 'VERIFIED' },
        recipient: { id: 'usr-2', kycStatus: 'UNVERIFIED' }
      });
      expect(res.decision).toBe('MANUAL_REVIEW');
    });
  });

  describe('AML Sanctions & PEP Rule', () => {
    const amlRule = new AmlRule();

    it('should ALLOW clean transaction with low risk score', () => {
      const res = amlRule.evaluate({
        senderAmlRiskScore: 10,
        recipientAmlRiskScore: 15,
        isPoliticallyExposed: false
      });
      expect(res.decision).toBe('ALLOW');
    });

    it('should DENY if participant is on sanctions list', () => {
      const res = amlRule.evaluate({
        recipientIsSanctioned: true
      });
      expect(res.decision).toBe('DENY');
    });

    it('should DENY if risk score is critical (>= 85)', () => {
      const res = amlRule.evaluate({
        senderAmlRiskScore: 92
      });
      expect(res.decision).toBe('DENY');
    });

    it('should require MANUAL_REVIEW for PEP or medium risk (>= 60)', () => {
      const res = amlRule.evaluate({
        senderAmlRiskScore: 65,
        isPoliticallyExposed: true
      });
      expect(res.decision).toBe('MANUAL_REVIEW');
    });
  });

  describe('Amount Threshold Rule (> $10k USD)', () => {
    const thresholdRule = new AmountThresholdRule();

    it('should ALLOW amounts under $10,000 USD', () => {
      const res = thresholdRule.evaluate({
        amount: Money.fromMinor(999900n, 'USD') // $9,999.00
      });
      expect(res.decision).toBe('ALLOW');
    });

    it('should flag MANUAL_REVIEW for amounts exceeding $10,000 USD', () => {
      const res = thresholdRule.evaluate({
        amount: Money.fromMinor(1500000n, 'USD') // $15,000.00
      });
      expect(res.decision).toBe('MANUAL_REVIEW');
      expect(res.reason).toContain('$10,000.00');
    });
  });

  describe('Country Jurisdiction Rule', () => {
    const countryRule = new CountryRule();

    it('should ALLOW clean countries (US -> GB)', () => {
      const res = countryRule.evaluate({
        senderCountry: 'US',
        recipientCountry: 'GB'
      });
      expect(res.decision).toBe('ALLOW');
    });

    it('should DENY prohibited countries (e.g. KP / IR / CU)', () => {
      const res = countryRule.evaluate({
        senderCountry: 'US',
        recipientCountry: 'KP'
      });
      expect(res.decision).toBe('DENY');
    });

    it('should require MANUAL_REVIEW for elevated risk countries', () => {
      const res = countryRule.evaluate({
        senderCountry: 'US',
        recipientCountry: 'YE'
      });
      expect(res.decision).toBe('MANUAL_REVIEW');
    });
  });

  describe('Velocity Control Rule', () => {
    const velocityRule = new VelocityRule(10); // max 10 tx/hr

    it('should ALLOW normal tx frequency', () => {
      const res = velocityRule.evaluate({
        senderRecentTxCountLastHour: 3,
        senderRecentVolumeMinorLastHour: 10000n
      });
      expect(res.decision).toBe('ALLOW');
    });

    it('should DENY when limit exceeded', () => {
      const res = velocityRule.evaluate({
        senderRecentTxCountLastHour: 15,
        senderRecentVolumeMinorLastHour: 100000n
      });
      expect(res.decision).toBe('DENY');
    });
  });
});
