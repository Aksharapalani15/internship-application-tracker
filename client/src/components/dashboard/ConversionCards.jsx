import React from 'react';
import { TrendingUp, CheckCircle, PieChart } from 'lucide-react';

export default function ConversionCards({ stats }) {
  if (!stats) return null;

  const { conversionRates = {}, statusCounts = {} } = stats;
  const interviewRate = conversionRates.interviewConversionRate ?? 0;
  const offerRate = conversionRates.offerConversionRate ?? 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}
    >
      {/* Interview Conversion Rate Card */}
      <div className="card" style={{ padding: '1.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
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
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Interview Conversion
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ratio of submitted apps reaching interview
              </p>
            </div>
          </div>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--accent-coral)',
            }}
          >
            {interviewRate.toFixed(1)}%
          </span>
        </div>

        {/* Progress Track */}
        <div
          style={{
            height: '8px',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '0.65rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(interviewRate, 100)}%`,
              backgroundColor: 'var(--accent-coral)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{statusCounts.Interview || 0} Interviews + {statusCounts.Offer || 0} Offers</span>
          <span>Target: &gt;20%</span>
        </div>
      </div>

      {/* Offer Conversion Rate Card */}
      <div className="card" style={{ padding: '1.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ECF7EE',
                color: '#196332',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Offer Conversion
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ratio of interviews converting to offers
              </p>
            </div>
          </div>
          <span
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#196332',
            }}
          >
            {offerRate.toFixed(1)}%
          </span>
        </div>

        {/* Progress Track */}
        <div
          style={{
            height: '8px',
            backgroundColor: 'var(--bg-canvas-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            marginBottom: '0.65rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(offerRate, 100)}%`,
              backgroundColor: '#2E884F',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{statusCounts.Offer || 0} Offers from {(statusCounts.Interview || 0) + (statusCounts.Offer || 0)} Stages</span>
          <span>Target: &gt;30%</span>
        </div>
      </div>
    </div>
  );
}
