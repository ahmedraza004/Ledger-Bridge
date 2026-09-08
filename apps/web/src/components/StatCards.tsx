import React from 'react';
import { DollarSign, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatCardsProps {
  totalSettledAmount: string;
  totalPaymentsCount: number;
  pendingReviewCount: number;
  activeAccountsCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalSettledAmount,
  totalPaymentsCount,
  pendingReviewCount,
  activeAccountsCount
}) => {
  const cards = [
    {
      title: 'Settled Gross Volume',
      value: totalSettledAmount,
      change: '+14.2% today',
      icon: DollarSign,
      color: 'var(--accent-emerald)',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Total Transactions',
      value: totalPaymentsCount.toString(),
      change: '100% Invariant Balanced',
      icon: CheckCircle2,
      color: 'var(--accent-blue)',
      glow: 'rgba(56, 189, 248, 0.15)'
    },
    {
      title: 'Compliance Manual Queue',
      value: pendingReviewCount.toString(),
      change: pendingReviewCount > 0 ? 'Action required' : 'Queue clear',
      icon: AlertTriangle,
      color: pendingReviewCount > 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      title: 'Active Chart of Accounts',
      value: activeAccountsCount.toString(),
      change: '5 Asset / 5 Liability',
      icon: ShieldCheck,
      color: 'var(--accent-purple)',
      glow: 'rgba(168, 85, 247, 0.15)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: card.glow,
              filter: 'blur(30px)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                {card.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}>
                <Icon size={18} />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: card.color, fontWeight: 500 }}>
              {card.change}
            </div>
          </div>
        );
      })}
    </div>
  );
};
