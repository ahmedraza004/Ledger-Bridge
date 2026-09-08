import React, { useState, useEffect } from 'react';
import { Send, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Key, Check } from 'lucide-react';

interface PaymentWizardProps {
  onPaymentCreated: () => void;
  tenantId: string;
}

export const PaymentWizard: React.FC<PaymentWizardProps> = ({ onPaymentCreated, tenantId }) => {
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('2500.00');
  const [senderCountry, setSenderCountry] = useState('US');
  const [recipientCountry, setRecipientCountry] = useState('GB');
  const [senderKyc, setSenderKyc] = useState<'VERIFIED' | 'UNVERIFIED'>('VERIFIED');
  const [amlRiskScore, setAmlRiskScore] = useState<number>(12);
  const [reference, setReference] = useState('INV-CROSS-BORDER-2026');
  const [idempotencyKey, setIdempotencyKey] = useState(`idem_${Date.now()}`);

  const [exchangeRate, setExchangeRate] = useState<number>(0.92);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Fetch FX quote whenever currencies or amount change
  useEffect(() => {
    fetchQuote();
  }, [sourceCurrency, targetCurrency, amount]);

  const fetchQuote = async () => {
    setIsQuoting(true);
    try {
      const amountNum = parseFloat(amount) || 100;
      const minor = Math.round(amountNum * 100);

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          sourceCurrency,
          targetCurrency,
          sourceAmountMinor: minor.toString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExchangeRate(data.exchangeRate);
      }
    } catch {
      // Fallback
      setExchangeRate(sourceCurrency === targetCurrency ? 1.0 : 0.92);
    } finally {
      setIsQuoting(false);
    }
  };

  const calculateTargetAmount = () => {
    const parsed = parseFloat(amount) || 0;
    const fee = parsed * 0.002; // 0.2% fee
    const net = parsed - fee;
    return (net * exchangeRate).toFixed(2);
  };

  // Simulated Rule Pre-evaluation
  const isHighValue = (parseFloat(amount) || 0) > 10000;
  const isBlockedCountry = ['KP', 'IR', 'SY', 'CU', 'RU'].includes(senderCountry) || ['KP', 'IR', 'SY', 'CU', 'RU'].includes(recipientCountry);
  const isUnverifiedSender = senderKyc === 'UNVERIFIED';

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const amountNum = parseFloat(amount) || 0;
      const minor = Math.round(amountNum * 100);

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': idempotencyKey,
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          tenantId,
          sourceAccountId: 'acc-cust-1',
          destinationAccountId: 'acc-cust-3',
          amountMinor: minor.toString(),
          currency: sourceCurrency,
          targetCurrency: targetCurrency,
          reference,
          senderInfo: {
            id: 'usr-alice-corp',
            name: 'Alice Corporate Treasury',
            country: senderCountry,
            kycStatus: senderKyc,
            amlRiskScore
          },
          recipientInfo: {
            id: 'usr-bob-logistics',
            name: 'Bob Logistics Europe',
            country: recipientCountry,
            kycStatus: 'VERIFIED',
            amlRiskScore: 8
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setResultMessage({
          type: 'error',
          text: `Payment Execution Denied: ${data.message || 'Validation failed'}`
        });
      } else if (data.requiresManualReview) {
        setResultMessage({
          type: 'warning',
          text: `Payment ${data.id.slice(0, 8)} held for Manual Compliance Review: ${data.validationReasons?.join(', ')}`
        });
        onPaymentCreated();
      } else {
        setResultMessage({
          type: 'success',
          text: `Payment ${data.id.slice(0, 8)} settled successfully via ${data.settlementRailTxId || 'FasterPayments Rail'}! Balanced in double-entry ledger.`
        });
        onPaymentCreated();
        setIdempotencyKey(`idem_${Date.now()}`);
      }
    } catch (err: unknown) {
      setResultMessage({
        type: 'error',
        text: `Network / Gateway Error: ${(err as Error).message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="var(--accent-blue)" />
            Institutional Payment & FX Orchestrator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Multi-currency execution with Frankfurter real-time FX, compliance rule gating, and double-entry ledger commit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIdempotencyKey(`idem_${Date.now()}`)}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', padding: '6px 10px' }}
        >
          <Key size={13} />
          New Idempotency Key
        </button>
      </div>

      <form onSubmit={handleExecutePayment}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          {/* Transfer Amount & Currency */}
          <div style={{ background: 'rgba(10, 14, 24, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              SOURCE AMOUNT & CURRENCY
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="0.01"
                className="form-input font-mono"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <select
                className="form-input"
                style={{ width: '110px' }}
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SAR">SAR (﷼)</option>
              </select>
            </div>

            {/* Target Currency & Live Quote */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>TARGET CURRENCY (FX)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={11} className={isQuoting ? 'spin' : ''} />
                  Rate: 1 {sourceCurrency} = {exchangeRate.toFixed(4)} {targetCurrency}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  className="form-input font-mono"
                  style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center' }}
                >
                  {calculateTargetAmount()}
                </div>
                <select
                  className="form-input"
                  style={{ width: '110px' }}
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SAR">SAR (﷼)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance & Risk Simulation Controls */}
          <div style={{ background: 'rgba(10, 14, 24, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
              SIMULATED COMPLIANCE & RISK INPUTS
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sender Country</span>
                <select className="form-input" style={{ fontSize: '0.85rem' }} value={senderCountry} onChange={(e) => setSenderCountry(e.target.value)}>
                  <option value="US">US (United States)</option>
                  <option value="GB">GB (United Kingdom)</option>
                  <option value="DE">DE (Germany)</option>
                  <option value="SA">SA (Saudi Arabia)</option>
                  <option value="KP">KP (North Korea - Blocked)</option>
                  <option value="IR">IR (Iran - Blocked)</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recipient Country</span>
                <select className="form-input" style={{ fontSize: '0.85rem' }} value={recipientCountry} onChange={(e) => setRecipientCountry(e.target.value)}>
                  <option value="GB">GB (United Kingdom)</option>
                  <option value="US">US (United States)</option>
                  <option value="DE">DE (Germany)</option>
                  <option value="YE">YE (Yemen - High Risk)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sender KYC Status</span>
                <select className="form-input" style={{ fontSize: '0.85rem' }} value={senderKyc} onChange={(e) => setSenderKyc(e.target.value as any)}>
                  <option value="VERIFIED">VERIFIED (Allowed)</option>
                  <option value="UNVERIFIED">UNVERIFIED (Denied)</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AML Score ({amlRiskScore})</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={amlRiskScore}
                  onChange={(e) => setAmlRiskScore(parseInt(e.target.value, 10))}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Rules Gate Preview Pill */}
        <div style={{
          background: isBlockedCountry || isUnverifiedSender ? 'rgba(244, 63, 94, 0.1)' : isHighValue || amlRiskScore >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isBlockedCountry || isUnverifiedSender ? 'rgba(244, 63, 94, 0.3)' : isHighValue || amlRiskScore >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} color={isBlockedCountry || isUnverifiedSender ? 'var(--accent-rose)' : isHighValue || amlRiskScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-emerald)'} />
            <span>
              <strong>Rules Gate Assessment: </strong>
              {isBlockedCountry ? 'DENY (Sanctioned Country)' : isUnverifiedSender ? 'DENY (Sender KYC missing)' : isHighValue ? 'MANUAL REVIEW (Amount > $10,000 USD)' : amlRiskScore >= 60 ? 'MANUAL REVIEW (Elevated AML Risk)' : 'ALLOW (All 5 Domain Compliance Rules Pass)'}
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Idempotency: {idempotencyKey}
          </span>
        </div>

        {resultMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: resultMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : resultMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${resultMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : resultMessage.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: resultMessage.type === 'success' ? '#34d399' : resultMessage.type === 'warning' ? '#fbbf24' : '#fb7185',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {resultMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {resultMessage.text}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {isSubmitting ? 'Validating & Orchestrating Payment...' : 'Execute Payment Lifecycle'}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};
