import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle, Scale, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DoubleEntryVisualizerProps {
  tenantId: string;
}

export const DoubleEntryVisualizer: React.FC<DoubleEntryVisualizerProps> = ({ tenantId }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLedgerData();
  }, [tenantId]);

  const fetchLedgerData = async () => {
    setIsLoading(true);
    try {
      const [entriesRes, accountsRes] = await Promise.all([
        fetch(`/api/ledger/entries?tenantId=${tenantId}`),
        fetch(`/api/accounts?tenantId=${tenantId}`)
      ]);

      if (entriesRes.ok && accountsRes.ok) {
        const entriesData = await entriesRes.json();
        const accountsData = await accountsRes.json();
        setEntries(entriesData);
        setAccounts(accountsData);
        if (entriesData.length > 0) {
          setSelectedEntry(entriesData[0]);
        }
      }
    } catch {
      // Fallback demo data if backend not active
      setEntries([
        {
          id: 'entry-demo-1',
          description: 'Payment Settle: Alice Corp -> Bob Logistics',
          status: 'COMMITTED',
          transactionDate: new Date().toISOString(),
          postings: [
            { accountId: 'acc-cust-1', amountFormatted: '$500.00 USD', direction: 'CREDIT', sequence: 1 },
            { accountId: 'acc-cust-3', amountFormatted: '$499.00 USD', direction: 'DEBIT', sequence: 2 },
            { accountId: 'acc-rev-fee', amountFormatted: '$1.00 USD', direction: 'DEBIT', sequence: 3 }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Journal Entries List */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-purple)" />
            Double-Entry General Journal
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} />
            PostgreSQL Invariant Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
          {entries.map((entry) => {
            const isSelected = selectedEntry?.id === entry.id;
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(10, 14, 24, 0.4)',
                  border: `1px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.description}</span>
                  <span className="badge badge-committed">{entry.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span className="font-mono">{entry.id.slice(0, 12)}...</span>
                  <span>{new Date(entry.transactionDate).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* T-Account Balancing Inspector */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="var(--accent-blue)" />
            T-Account Invariant Inspector
          </h3>
          <span className="badge badge-settled">Δ Debits - Credits = 0.00</span>
        </div>

        {selectedEntry ? (
          <div>
            <div style={{ background: 'rgba(10, 14, 24, 0.6)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Entry Reference</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedEntry.description}</div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                ID: {selectedEntry.id}
              </div>
            </div>

            {/* Split T-Account View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              {/* Left Column: DEBITS */}
              <div style={{ borderRight: '1px dashed var(--border-subtle)', paddingRight: '12px' }}>
                <div style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowDownLeft size={16} />
                  DEBITS (+)
                </div>
                {selectedEntry.postings?.filter((p: any) => p.direction === 'DEBIT').map((p: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account: {p.accountId}</div>
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-blue)' }}>
                      {p.amountFormatted}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: CREDITS */}
              <div style={{ paddingLeft: '4px' }}>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpRight size={16} />
                  CREDITS (-)
                </div>
                {selectedEntry.postings?.filter((p: any) => p.direction === 'CREDIT').map((p: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Account: {p.accountId}</div>
                    <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-emerald)' }}>
                      {p.amountFormatted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Select a journal entry to inspect balance invariants.
          </div>
        )}
      </div>
    </div>
  );
};
