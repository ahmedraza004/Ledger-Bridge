import React from 'react';
import { CheckCircle2, ArrowRight, XCircle, RotateCcw } from 'lucide-react';

interface StateMachineFlowProps {
  currentState?: string;
}

export const StateMachineFlow: React.FC<StateMachineFlowProps> = ({ currentState = 'settled' }) => {
  const steps = [
    { key: 'quoted', title: '1. Quoted', desc: 'Guaranteed FX Rate Locked' },
    { key: 'validated', title: '2. Validated', desc: 'KYC, AML, Country & Threshold' },
    { key: 'committed', title: '3. Committed', desc: 'Double-Entry Invariant Stored' },
    { key: 'submitted', title: '4. Submitted', desc: 'Dispatched to Payment Rail' },
    { key: 'settled', title: '5. Settled', desc: 'Finalized Settlement Complete' }
  ];

  const getStepStatus = (stepKey: string) => {
    if (currentState === 'failed') return stepKey === 'validated' ? 'failed' : 'neutral';
    if (currentState === 'reversed') return 'reversed';

    const order = ['quoted', 'validated', 'committed', 'submitted', 'settled'];
    const currentIndex = order.indexOf(currentState);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex <= currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>XState Payment State Machine Engine</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Strict deterministic state transitions with guard conditions and automatic rollback triggers.
          </p>
        </div>
        <span className={`badge badge-${currentState}`}>State: {currentState}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step.key);
          const isCurrent = currentState === step.key;

          return (
            <React.Fragment key={step.key}>
              <div style={{
                flex: 1,
                minWidth: '180px',
                background: isCurrent ? 'rgba(56, 189, 248, 0.12)' : status === 'completed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(10, 14, 24, 0.4)',
                border: `1px solid ${isCurrent ? 'var(--accent-blue)' : status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                padding: '14px',
                borderRadius: '10px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {status === 'completed' ? (
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  ) : (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCurrent ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isCurrent ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                    {step.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {step.desc}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <ArrowRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Alternative Terminal States info */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '20px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)' }}>
          <XCircle size={14} />
          <strong>Alternative Branch:</strong> Terminal Fail on rule violation or rail reject
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
          <RotateCcw size={14} />
          <strong>Reversal Flow:</strong> Settled payments can transition to Reversed on dispute
        </div>
      </div>
    </div>
  );
};
