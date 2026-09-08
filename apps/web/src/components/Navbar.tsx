import React from 'react';
import { Layers, ShieldCheck, Activity, RefreshCw, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tenantId: string;
  setTenantId: (tenant: string) => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tenantId,
  setTenantId,
  onSeedData,
  isSeeding
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'payments', label: 'Payments', icon: RefreshCw },
    { id: 'ledger', label: 'Double-Entry Ledger', icon: Layers },
    { id: 'compliance', label: 'Compliance & Rules', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail', icon: Database },
    { id: 'idempotency', label: 'Idempotency Lab', icon: RefreshCw },
    { id: 'telemetry', label: 'Telemetry & Metrics', icon: Activity }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              LedgerBridge
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }}></span>
              INSTITUTIONAL CORE V1.0
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Controls: Tenant selector & Seed Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            style={{
              background: 'rgba(15, 21, 35, 0.8)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="default-tenant">Tenant: Global Multi-Tenant Core</option>
            <option value="enterprise-corp">Tenant: Enterprise Treasury LLC</option>
          </select>

          <button
            onClick={onSeedData}
            disabled={isSeeding}
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={isSeeding ? 'spin' : ''} />
            {isSeeding ? 'Seeding...' : 'Seed 20 Payments & 10 Accounts'}
          </button>
        </div>
      </div>
    </header>
  );
};
