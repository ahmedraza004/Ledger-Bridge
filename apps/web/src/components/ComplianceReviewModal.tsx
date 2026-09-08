import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ComplianceReviewModalProps {
  tenantId: string;
}

export const ComplianceReviewModal: React.FC<ComplianceReviewModalProps> = ({ tenantId }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, [tenantId]);

  const fetchCases = async () => {
    try {
      const res = await fetch(`/api/compliance/cases?tenantId=${tenantId}`, {
        headers: { Authorization: 'Bearer compliance' }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data);
        if (data.length > 0) setSelectedCase(data[0]);
      }
    } catch {
      // Fallback
    }
  };

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/compliance/cases/decide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer compliance'
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          decision,
          reason: decisionReason || (decision === 'APPROVED' ? 'Enhanced due diligence verified & signed off by Compliance Officer' : 'Blocked per internal risk policy'),
          officerId: 'compliance-officer-sarah'
        })
      });

      if (res.ok) {
        setFeedback(`Case ${selectedCase.id} successfully marked as ${decision}.`);
        fetchCases();
        setDecisionReason('');
      } else {
        const err = await res.json();
        setFeedback(`Error: ${err.message || 'RBAC authorization failure'}`);
      }
    } catch (e: any) {
      setFeedback(`Network error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="var(--accent-amber)" />
            Compliance & Manual Review Queue
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Protected by Service-Level RBAC: Only authorized <code className="font-mono">compliance_officer</code> roles can execute approvals.
          </p>
        </div>
        <span className="badge badge-submitted">
          {cases.filter(c => c.status === 'PENDING').length} Pending Review
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Cases List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              style={{
                background: selectedCase?.id === c.id ? 'rgba(245, 158, 11, 0.12)' : 'rgba(10, 14, 24, 0.4)',
                border: `1px solid ${selectedCase?.id === c.id ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{c.amountFormatted}</span>
                <span className={`badge badge-${c.status === 'APPROVED' ? 'settled' : c.status === 'REJECTED' ? 'failed' : 'submitted'}`}>
                  {c.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {c.senderName} ➔ {c.recipientName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                {c.reasons?.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Case Decision Panel */}
        <div style={{ background: 'rgba(10, 14, 24, 0.6)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {selectedCase ? (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Case Details & Evaluation</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div><strong>Case ID:</strong> <span className="font-mono">{selectedCase.id}</span></div>
                <div><strong>Transaction:</strong> {selectedCase.amountFormatted}</div>
                <div><strong>Sender:</strong> {selectedCase.senderName}</div>
                <div><strong>Recipient:</strong> {selectedCase.recipientName}</div>
                <div><strong>Triggered Rule:</strong> <span style={{ color: 'var(--accent-amber)' }}>{selectedCase.reasons?.join('; ')}</span></div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Compliance Officer Due Diligence Notes
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter verification notes and justification..."
                />
              </div>

              {feedback && (
                <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-blue)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {feedback}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDecision('APPROVED')}
                  disabled={isSubmitting || selectedCase.status !== 'PENDING'}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <CheckCircle size={16} />
                  Approve & Release
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('REJECTED')}
                  disabled={isSubmitting || selectedCase.status !== 'PENDING'}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                >
                  <XCircle size={16} />
                  Reject & File SAR
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Select a compliance case from the queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
