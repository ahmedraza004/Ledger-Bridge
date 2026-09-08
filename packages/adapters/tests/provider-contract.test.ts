import { Money } from '@ledgerbridge/domain';
import { FrankfurterFxAdapter } from '../src/fx/frankfurter.adapter';
import { MockFxAdapter } from '../src/fx/mock-fx.adapter';
import { MockKycAdapter } from '../src/kyc/mock-kyc.adapter';
import { MockAmlAdapter } from '../src/aml/mock-aml.adapter';
import { MockCompanyVerificationAdapter } from '../src/company/mock-company-verification.adapter';
import { MockPaymentRailAdapter } from '../src/rails/mock-payment-rail.adapter';
import { MockRegulatoryAdapter } from '../src/regulatory/mock-regulatory.adapter';
import { HmacWebhookValidator } from '../src/security/hmac-webhook.validator';

describe('Universal Provider Contract Testing Suite', () => {
  describe('Port 1: KYC Provider Contract', () => {
    const kyc = new MockKycAdapter();

    it('should return valid identity verification payload satisfying contract', async () => {
      const res = await kyc.verifyIdentity({
        userId: 'usr-1',
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        country: 'US',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: 'P12345678'
      });

      expect(res.verificationId).toBeDefined();
      expect(['VERIFIED', 'UNVERIFIED', 'REQUIRES_MANUAL_REVIEW', 'REJECTED']).toContain(res.status);
      expect(typeof res.riskScore).toBe('number');
      expect(res.checks).toHaveProperty('idDocumentValid');
      expect(res.checks).toHaveProperty('faceMatch');
    });

    it('should check existing verification status', async () => {
      const status = await kyc.checkStatus('ver-123');
      expect(status.status).toBe('VERIFIED');
    });
  });

  describe('Port 2: AML Provider Contract', () => {
    const aml = new MockAmlAdapter();

    it('should screen clean entity and return low risk score', async () => {
      const res = await aml.screenEntity({
        entityId: 'ent-1',
        name: 'Good Citizen LLC',
        country: 'US'
      });

      expect(res.screeningId).toBeDefined();
      expect(res.isSanctioned).toBe(false);
      expect(res.riskScore).toBeLessThan(50);
      expect(Array.isArray(res.matchedLists)).toBe(true);
    });

    it('should identify sanctioned entities with high risk score', async () => {
      const res = await aml.screenEntity({
        entityId: 'ent-2',
        name: 'Sanctioned Corp International',
        country: 'RU'
      });

      expect(res.isSanctioned).toBe(true);
      expect(res.riskScore).toBeGreaterThanOrEqual(85);
      expect(res.matchedLists.length).toBeGreaterThan(0);
    });
  });

  describe('Port 3: Company Verification Provider Contract', () => {
    const registry = new MockCompanyVerificationAdapter();

    it('should verify active company legal status and officers', async () => {
      const res = await registry.verifyCompany({
        companyName: 'Acme Global Ltd',
        registrationNumber: 'REG-99238',
        jurisdiction: 'GB'
      });

      expect(res.isValid).toBe(true);
      expect(res.status).toBe('ACTIVE');
      expect(res.directors.length).toBeGreaterThan(0);
      expect(res.registeredAddress).toBeDefined();
    });
  });

  describe('Port 4: FX Provider Contract (Frankfurter & Mock)', () => {
    const frankfurter = new FrankfurterFxAdapter();
    const mockFx = new MockFxAdapter();

    it('should return 1.0 parity for identical currencies in both adapters', async () => {
      const r1 = await frankfurter.getExchangeRate({ fromCurrency: 'USD', toCurrency: 'USD' });
      const r2 = await mockFx.getExchangeRate({ fromCurrency: 'USD', toCurrency: 'USD' });

      expect(r1.rate).toBe(1.0);
      expect(r2.rate).toBe(1.0);
    });

    it('should return positive exchange rates for cross currencies', async () => {
      const r = await frankfurter.getExchangeRate({ fromCurrency: 'USD', toCurrency: 'EUR' });
      expect(r.rate).toBeGreaterThan(0);
      expect(r.fromCurrency).toBe('USD');
      expect(r.toCurrency).toBe('EUR');
    });

    it('should calculate guaranteed quote with locked fee and expiration', async () => {
      const quote = await frankfurter.getGuaranteedQuote({
        sourceAmount: Money.fromMinor(10000n, 'USD'),
        targetCurrency: 'EUR',
        ttlSeconds: 60
      });

      expect(quote.quoteId).toBeDefined();
      expect(quote.sourceAmount.currency).toBe('USD');
      expect(quote.targetAmount.currency).toBe('EUR');
      expect(quote.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(quote.feeAmount.amountMinor).toBeGreaterThan(0n);
    });
  });

  describe('Port 5: Payment Rail Provider Contract', () => {
    const rail = new MockPaymentRailAdapter();

    it('should submit payout and return submission confirmation', async () => {
      const res = await rail.submitPayout({
        paymentId: 'pay-rail-1',
        sourceAmount: Money.fromMinor(50000n, 'USD'),
        targetAmount: Money.fromMinor(50000n, 'USD'),
        senderName: 'Alice Corp',
        recipientName: 'Bob Corp',
        recipientIbanOrAccountNumber: 'GB29NWBK60161331926819',
        recipientBankCode: 'NWBKGB2L',
        reference: 'INV-2026-001'
      });

      expect(res.railTxId).toBeDefined();
      expect(res.status).toBe('SUBMITTED');
      expect(res.feeCharged.amountMinor).toBeGreaterThan(0n);
    });
  });

  describe('Port 6: Regulatory Provider Contract', () => {
    const reg = new MockRegulatoryAdapter('FinCEN-SAR-Portal');

    it('should file Suspicious Activity Report (SAR) with acknowledgement receipt', async () => {
      const filing = await reg.submitFiling({
        filingType: 'SAR',
        tenantId: 'tenant-1',
        paymentId: 'pay-suspicious-1',
        subjectName: 'High Risk Trader',
        subjectId: 'usr-999',
        amount: Money.fromMinor(5000000n, 'USD'),
        suspicionNarrative: 'Multiple rapid high-value cross-border transfers to unverified entity',
        indicators: ['HIGH_VELOCITY', 'SANCTION_PROXIMITY']
      });

      expect(filing.filingReference).toContain('SAR-');
      expect(filing.regulatoryBody).toBe('FinCEN-SAR-Portal');
      expect(filing.status).toBe('ACKNOWLEDGED');
      expect(filing.acknowledgementReceiptNumber).toBeDefined();
    });
  });

  describe('Security: HMAC Webhook Signature Verification', () => {
    it('should generate and verify valid HMAC SHA-256 signatures', () => {
      const secret = 'super-secret-webhook-key-2026';
      const payload = JSON.stringify({ event: 'payment.settled', id: 'pay-123', amount: 5000 });
      const signature = HmacWebhookValidator.generateSignature(payload, secret);

      expect(HmacWebhookValidator.verifySignature(payload, signature, secret)).toBe(true);
      expect(HmacWebhookValidator.verifySignature(payload, 'tampered-signature-1234567890', secret)).toBe(false);
      expect(HmacWebhookValidator.verifySignature(payload + 'tampered', signature, secret)).toBe(false);
    });
  });
});
