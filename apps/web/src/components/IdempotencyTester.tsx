import React, { useState } from 'react';
import { RefreshCw, ShieldCheck, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

interface IdempotencyTesterProps {
  tenantId: string;
}

export const IdempotencyTester: React.FC<IdempotencyTesterProps> = ({ tenantId }) => {
  const [fixedKey, setFixedKey] = useState(`idem_test_${Date.now()}`);
  const [amount, setAmount] = useState('150.00');
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleTestConcurrent = async (sendTwiceWithSameKey: boolean) => {
    setIsRunning(true);
    const keyToUse = sendTwiceWithSameKey ? fixedKey : `idem_auto_${Date.now()}`;

    const makeRequest = async (callNumber: number) => {
      const startTime = performance.now();
      try {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-correlation-id': keyToUse,
            'x-tenant-id': tenantId
          },
          body: JSON.stringify({
            tenantId,
            sourceAccountId: 'acc-cust-1',
            destinationAccountId: 'acc-cust-3',
            amountMinor: '15000',
            currency: 'USD',
            reference: `IDEM-TEST-${callNumber}`,
            senderInfo: { id: 'usr-1', name: 'Alice Corp', country: 'US', kycStatus: 'VERIFIED' },
            recipientInfo: { id: 'usr-2', name: 'Bob Logistics', country: 'GB', kycStatus: 'VERIFIED' }
          })
        });

        const data = await res.json();
        const duration = Math.round(performance.now() - startTime);

        return {
          callNumber,
          key: keyToUse,
          status: res.status,
          isCached: data.isCachedIdempotentResponse || false,
          paymentId: data.id,
          duration,
          timestamp: new Date().toLocaleTimeString()
        };
      } catch (err: any) {
        return {
          callNumber,
          key: keyToUse,
          status: 'ERROR',
          message: err.message,
          timestamp: new Date().toLocaleTimeString()
        };
      }
    };

    // Fire 2 concurrent or sequential requests
    const res1 = await makeRequest(1);
    const res2 = await makeRequest(2);

    setLogs((prev) => [res2, res1, ...prev]);
    setIsRunning(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={20} color="var(--accent-blue)" />
            Distributed Idempotency & Replay Defense Lab
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Test double-charge prevention, replay detection, and SHA-256 payload hash validation.
          </p>
        </div>
        <button
          onClick={() => setFixedKey(`idem_test_${Date.now()}`)}
          className="btn-secondary"
          style={{ fontSize: '0.8rem' }}
        >
          Generate New Key
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(10, 14, 24, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            FIXED IDEMPOTENCY KEY (SHARED ACROSS REQUESTS)
          </label>
          <input
            type="text"
            className="form-input font-mono"
            style={{ fontSize: '0.9rem', marginBottom: '14px' }}
            value={fixedKey}
            onChange={(e) => setFixedKey(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleTestConcurrent(true)}
              disabled={isRunning}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Play size={16} />
              Replay Duplicate Key
            </button>
            <button
              onClick={() => setLogs([])}
              className="btn-secondary"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div style={{ background: 'rgba(10, 14, 24, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          <div><strong style={{ color: 'var(--accent-emerald)' }}>✓ Invariant 1:</strong> Exact payload replay returns cached 200 response without double-debiting ledger.</div>
          <div><strong style={{ color: 'var(--accent-rose)' }}>✓ Invariant 2:</strong> In-flight concurrent requests return 409 Conflict.</div>
          <div><strong style={{ color: 'var(--accent-amber)' }}>✓ Invariant 3:</strong> Different payload with same key returns 422 Payload Mismatch.</div>
        </div>
      </div>

      {/* Execution Log Table */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Call #</th>
              <th>Idempotency Key</th>
              <th>Status</th>
              <th>Cached Response?</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No replay requests triggered yet. Click "Replay Duplicate Key" above.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx}>
                  <td className="font-mono">{log.timestamp}</td>
                  <td>Request #{log.callNumber}</td>
                  <td className="font-mono">{log.key}</td>
                  <td>
                    <span className={`badge ${log.status === 201 || log.status === 200 ? 'badge-settled' : 'badge-failed'}`}>
                      HTTP {log.status}
                    </span>
                  </td>
                  <td>
                    {log.isCached ? (
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> YES (Zero Duplicate Postings)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--accent-blue)' }}>First Execution (Committed)</span>
                    )}
                  </td>
                  <td className="font-mono">{log.duration}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
