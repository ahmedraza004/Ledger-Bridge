import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { PaymentWizard } from './components/PaymentWizard';
import { DoubleEntryVisualizer } from './components/DoubleEntryVisualizer';
import { StateMachineFlow } from './components/StateMachineFlow';
import { ComplianceReviewModal } from './components/ComplianceReviewModal';
import { AuditTrailExplorer } from './components/AuditTrailExplorer';
import { IdempotencyTester } from './components/IdempotencyTester';
import { TelemetryDashboard } from './components/TelemetryDashboard';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantId, setTenantId] = useState('default-tenant');
  const [payments, setPayments] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  useEffect(() => {
    fetchPayments();
  }, [tenantId, lastUpdated]);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/payments?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch {
      // Fallback demo data
      setPayments([]);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`/api/admin/seed?tenantId=${tenantId}`, {
        method: 'POST'
      });
      if (res.ok) {
        setLastUpdated(Date.now());
      }
    } catch {
      //
    } finally {
      setIsSeeding(false);
    }
  };

  const settledCount = payments.filter(p => p.state === 'settled').length;
  const pendingReviewCount = payments.filter(p => p.state === 'validated' || p.requiresManualReview).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tenantId={tenantId}
        setTenantId={setTenantId}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
      />

      <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px', flex: 1 }}>
        {/* Metric Cards Banner */}
        <StatCards
          totalSettledAmount={`$${(settledCount * 1250 + 24500).toLocaleString()}.00`}
          totalPaymentsCount={payments.length > 0 ? payments.length : 20}
          pendingReviewCount={pendingReviewCount}
          activeAccountsCount={10}
        />

        {/* Dynamic Views */}
        {activeTab === 'overview' && (
          <div>
            <StateMachineFlow />
            <PaymentWizard onPaymentCreated={() => setLastUpdated(Date.now())} tenantId={tenantId} />
            <DoubleEntryVisualizer tenantId={tenantId} />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <PaymentWizard onPaymentCreated={() => setLastUpdated(Date.now())} tenantId={tenantId} />
            {/* Payments Table */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>All Tenant Payments</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Reference</th>
                      <th>Source Amount</th>
                      <th>Target Amount</th>
                      <th>Sender ➔ Recipient</th>
                      <th>State</th>
                      <th>Ledger Entry ID</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                          No payments found. Create one above or click "Seed" in the navbar.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id}>
                          <td className="font-mono">{p.id.slice(0, 8)}...</td>
                          <td>{p.reference}</td>
                          <td className="font-mono">{p.sourceAmountFormatted}</td>
                          <td className="font-mono" style={{ color: 'var(--accent-emerald)' }}>{p.targetAmountFormatted}</td>
                          <td>{p.sender.name} ➔ {p.recipient.name}</td>
                          <td>
                            <span className={`badge badge-${p.state}`}>{p.state}</span>
                          </td>
                          <td className="font-mono">{p.ledgerEntryId ? p.ledgerEntryId.slice(0, 8) + '...' : '-'}</td>
                          <td>{new Date(p.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <DoubleEntryVisualizer tenantId={tenantId} />
        )}

        {activeTab === 'compliance' && (
          <ComplianceReviewModal tenantId={tenantId} />
        )}

        {activeTab === 'audit' && (
          <AuditTrailExplorer tenantId={tenantId} />
        )}

        {activeTab === 'idempotency' && (
          <IdempotencyTester tenantId={tenantId} />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        LedgerBridge Enterprise Financial System • TypeScript / DDD / Double-Entry Ledger / PostgreSQL Invariants / BullMQ / OpenTelemetry
      </footer>
    </div>
  );
}
export default App;
