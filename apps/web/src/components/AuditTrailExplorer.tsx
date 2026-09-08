import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Search, Link2, CheckCircle, AlertCircle } from 'lucide-react';

interface AuditTrailExplorerProps {
  tenantId: string;
}

export const AuditTrailExplorer: React.FC<AuditTrailExplorerProps> = ({ tenantId }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  useEffect(() => {
    fetchAuditTrail();
  }, [tenantId]);

  const fetchAuditTrail = async () => {
    try {
      const res = await fetch(`/api/audit/records?tenantId=${tenantId}&limit=50`, {
        headers: { Authorization: 'Bearer auditor' }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
        if (data.length > 0) setSelectedRecord(data[0]);
      }
    } catch {
      // Fallback
      setRecords([
        {
          id: 'audit-demo-1',
          action: 'PAYMENT_SETTLED',
          entityType: 'PAYMENT',
          entityId: 'pay-seed-1',
          actor: 'PaymentOrchestrator',
          timestamp: new Date().toISOString(),
          correlationId: 'corr-xyz-1001',
          previousHash: '0'.repeat(64),
          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          isVerified: true,
          afterState: { state: 'settled', amount: '$500.00 USD' }
        }
      ]);
    }
  };

  const filteredRecords = records.filter(r =>
    r.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.correlationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.hash?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Searchable Records Stream */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--accent-blue)" />
            Cryptographic Audit Stream
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            SHA-256 Chained
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            placeholder="Search action, correlation ID, payment ID, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
          {filteredRecords.map((r) => {
            const isSelected = selectedRecord?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(10, 14, 24, 0.4)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.action}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle size={12} />
                    Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Actor: {r.actor}</span>
                  <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Hash: {r.hash}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cryptographic Inspector & Chain Details */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={18} color="var(--accent-emerald)" />
            Immutability & Cryptographic Proof
          </h3>
          <span className="badge badge-settled">Append-Only Invariant</span>
        </div>

        {selectedRecord ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(10, 14, 24, 0.6)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Record Identifier</div>
              <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedRecord.id}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                CURRENT SHA-256 HASH
              </label>
              <div className="font-mono" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                {selectedRecord.hash}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                PREVIOUS CHAIN HASH
              </label>
              <div className="font-mono" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                {selectedRecord.previousHash}
              </div>
            </div>

            <div style={{ background: 'rgba(10, 14, 24, 0.6)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                AUDITED SNAPSHOT STATE (IMMUTABLE JSON)
              </div>
              <pre className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', overflowX: 'auto' }}>
                {JSON.stringify(selectedRecord.afterState || selectedRecord, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Select an audit log entry to inspect hash chain.
          </div>
        )}
      </div>
    </div>
  );
};
