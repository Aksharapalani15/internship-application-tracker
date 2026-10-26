import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function ActivityChart({ activity = [] }) {
  const hasData = activity && activity.length > 0;

  // Find maximum count for scaling (minimum max of 5 for proportional scale)
  const maxCount = hasData
    ? Math.max(...activity.map((a) => a.count), 5)
    : 5;

  return (
    <div className="card" style={{ padding: '1.35rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-blush)',
              color: 'var(--accent-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Application Velocity
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Submissions over the past 6 calendar months
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No application activity recorded yet. Create applications to view monthly trends.
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', paddingTop: '1.5rem', paddingBottom: '0.5rem' }}>
          {activity.map((item, idx) => {
            const count = item.count || 0;
            const heightPercent = Math.max((count / maxCount) * 100, 8);

            // Format period (YYYY-MM to Short Month)
            let monthLabel = item.period;
            try {
              const [year, month] = item.period.split('-');
              const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
              monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
            } catch {
              monthLabel = item.period;
            }

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                }}
              >
                {/* Count Badge on top */}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: count > 0 ? 'var(--accent-coral)' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>

                {/* Animated Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    backgroundColor: count > 0 ? 'var(--accent-coral)' : 'var(--border-subtle)',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease',
                    boxShadow: count > 0 ? '0 2px 6px rgba(224, 122, 95, 0.2)' : 'none',
                    cursor: 'pointer',
                  }}
                  title={`${item.period}: ${count} applications`}
                />

                {/* Month Label */}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {monthLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
