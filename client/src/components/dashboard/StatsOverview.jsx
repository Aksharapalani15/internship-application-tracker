import React from 'react';
import { Briefcase, Send, Target, Award, Clock, XCircle } from 'lucide-react';

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const { totalApplications = 0, statusCounts = {}, interviewCount = 0, offerCount = 0, rejectionCount = 0 } = stats;

  const appliedCount = statusCounts.Applied || 0;
  const assessmentCount = statusCounts.Assessment || 0;
  const savedCount = statusCounts.Saved || 0;
  const inPipeline = appliedCount + assessmentCount + interviewCount;

  const cards = [
    {
      label: 'Total Applications',
      value: totalApplications,
      sub: `${savedCount} drafts saved`,
      icon: Briefcase,
      color: '#E07A5F',
      bgColor: 'var(--bg-blush)',
    },
    {
      label: 'Active Pipeline',
      value: inPipeline,
      sub: `${interviewCount} in interviews`,
      icon: Send,
      color: '#2B7EA8',
      bgColor: '#EDF3F8',
    },
    {
      label: 'Interviews',
      value: interviewCount,
      sub: `${assessmentCount} assessments`,
      icon: Target,
      color: '#712B74',
      bgColor: '#F8EEF8',
    },
    {
      label: 'Offers Received',
      value: offerCount,
      sub: offerCount > 0 ? 'Top candidate result' : 'Keep applying!',
      icon: Award,
      color: '#196332',
      bgColor: '#ECF7EE',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}
    >
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: c.bgColor,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={24} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {c.label}
              </div>
              <div
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  margin: '2px 0',
                }}
              >
                {c.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {c.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
