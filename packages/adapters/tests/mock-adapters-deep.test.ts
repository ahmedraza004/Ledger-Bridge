import { Money } from '@ledgerbridge/domain';
import {
  MockKycAdapter,
  MockAmlAdapter,
  MockCompanyVerificationAdapter,
  MockPaymentRailAdapter,
  MockRegulatoryAdapter,
  HmacWebhookValidator,
  FrankfurterFxAdapter,
  MockFxAdapter
} from '../src';

describe('Deep Mock Adapters & Integration Edge Cases', () => {
  describe('MockKycAdapter Edge Cases', () => {
    const kyc = new MockKycAdapter();

    it('should flag fraud simulation with high risk score and rejected status', async () => {
      const res = await kyc.verifyIdentity({
        userId: 'fraud-user-1',
        firstName: 'Suspicious',
        lastName: 'Fraudster',
        dob: '1985-05-05',
        country: 'US',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: '0000-INVALID'
      });

      expect(res.status).toBe('REJECTED');
      expect(res.riskScore).toBeGreaterThanOrEqual(90);
      expect(res.checks.idDocumentValid).toBe(false);
    });

    it('should flag manual review simulation', async () => {
      const res = await kyc.verifyIdentity({
        userId: 'review-user-1',
        firstName: 'Requires',
        lastName: 'ReviewNeeded',
        dob: '1992-08-12',
        country: 'GB',
        idDocumentType: 'DRIVING_LICENSE',
        idDocumentNumber: 'DL-99382'
      });

      expect(res.status).toBe('REQUIRES_MANUAL_REVIEW');
      expect(res.checks.faceMatch).toBe(false);
    });
  });

  describe('MockAmlAdapter Edge Cases', () => {
    const aml = new MockAmlAdapter();

    it('should detect Politically Exposed Persons (PEP)', async () => {
      const res = await aml.screenEntity({
        entityId: 'pep-1',
        name: 'Senator Bob Vance',
        country: 'US'
      });

      expect(res.isPoliticallyExposed).toBe(true);
      expect(res.isSanctioned).toBe(false);
      expect(res.matchedLists).toContain('GLOBAL-PEP-DATABASE');
    });

    it('should match multiple international sanctions lists for known bad actors', async () => {
      const res = await aml.screenEntity({
        entityId: 'bad-1',
        name: 'Blocked Entity Global',
        country: 'IR'
      });

      expect(res.isSanctioned).toBe(true);
      expect(res.matchedLists).toContain('OFAC-SDN');
      expect(res.matchedLists).toContain('EU-FINANCIAL-SANCTIONS');
    });
  });

  describe('MockCompanyVerificationAdapter Edge Cases', () => {
    const registry = new MockCompanyVerificationAdapter();

    it('should identify dissolved companies and return invalid status', async () => {
      const res = await registry.verifyCompany({
        companyName: 'Dissolved Ventures LLC',
        registrationNumber: 'REG-DISSOLVED-001',
        jurisdiction: 'GB'
      });

      expect(res.isValid).toBe(false);
      expect(res.status).toBe('DISSOLVED');
    });

    it('should extract directors and beneficial owners for active companies', async () => {
      const res = await registry.verifyCompany({
        companyName: 'Apex International Corp',
        registrationNumber: 'REG-ACTIVE-999',
        jurisdiction: 'US'
      });

      expect(res.isValid).toBe(true);
      expect(res.directors.length).toBeGreaterThan(0);
      expect(res.beneficialOwners.length).toBeGreaterThan(0);
    });
  });

  describe('MockPaymentRailAdapter Edge Cases', () => {
    const rail = new MockPaymentRailAdapter();

    it('should simulate rail rejection for simulated failed recipients', async () => {
      const res = await rail.submitPayout({
        paymentId: 'pay-fail-rail',
        sourceAmount: Money.fromMinor(10000n, 'USD'),
        targetAmount: Money.fromMinor(10000n, 'USD'),
        senderName: 'Alice',
        recipientName: 'FailRail User',
        recipientIbanOrAccountNumber: 'GB0000000000',
        recipientBankCode: 'FAILGB',
        reference: 'FAIL-TEST'
      });

      expect(res.status).toBe('REJECTED');
      expect(res.railTxId).toContain('rail_err_');
    });
  });

  describe('Webhook Signature Tampering Defense', () => {
    it('should reject timing-attack modified signatures', () => {
      const secret = 'webhook-key-production-2026';
      const payload = JSON.stringify({ event: 'payout.confirmed', id: 'tx-999' });
      const validSig = HmacWebhookValidator.generateSignature(payload, secret);

      expect(HmacWebhookValidator.verifySignature(payload, validSig, secret)).toBe(true);
      expect(HmacWebhookValidator.verifySignature(payload, validSig.slice(0, -1) + '0', secret)).toBe(false);
      expect(HmacWebhookValidator.verifySignature(payload, '', secret)).toBe(false);
    });
  });
});
