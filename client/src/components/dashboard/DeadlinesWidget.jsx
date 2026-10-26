import React, { useState } from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDate, getRelativeDeadline } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';

export default function DeadlinesWidget({ deadlines, onSelectApplication }) {
  const [activeTab, setActiveTab] = useState('upcomingDeadlines');

  if (!deadlines) return null;

  const {
    upcomingDeadlines = [],
    overdueDeadlines = [],
    upcomingFollowUps = [],
    overdueFollowUps = [],
  } = deadlines;

  const tabs = [
    {
      id: 'upcomingDeadlines',
      label: 'Deadlines',
      count: upcomingDeadlines.length,
      icon: Calendar,
      items: upcomingDeadlines,
      isDateOverdue: false,
      type: 'deadline',
    },
    {
      id: 'upcomingFollowUps',
      label: 'Follow-ups',
      count: upcomingFollowUps.length,
      icon: Clock,
      items: upcomingFollowUps,
      isDateOverdue: false,
      type: 'follow_up',
    },
    {
      id: 'overdueDeadlines',
      label: 'Overdue Deadlines',
      count: overdueDeadlines.length,
      icon: AlertCircle,
      items: overdueDeadlines,
      isDateOverdue: true,
      type: 'deadline',
    },
    {
      id: 'overdueFollowUps',
      label: 'Overdue Follow-ups',
      count: overdueFollowUps.length,
      icon: AlertCircle,
      items: overdueFollowUps,
      isDateOverdue: true,
      type: 'follow_up',
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="card" style={{ marginBottom: '1.75rem' }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="card-title">Deadlines & Action Items</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Time-sensitive application deadlines and recruiter follow-ups
          </p>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-canvas-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
            gap: '3px',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--accent-coral)' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      padding: '1px 5px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: tab.isDateOverdue ? '#FEE2E2' : 'var(--bg-blush)',
                      color: tab.isDateOverdue ? '#DC2626' : 'var(--accent-coral)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '1rem 1.35rem' }}>
        {currentTab.items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={24} style={{ margin: '0 auto 0.5rem', color: '#2E884F' }} />
            No {currentTab.label.toLowerCase()} pending at this time!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentTab.items.map((item) => {
              const rel = getRelativeDeadline(item.date);
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectApplication && onSelectApplication(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-soft)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    cursor: onSelectApplication ? 'pointer' : 'default',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-blush)';
                    e.currentTarget.style.borderColor = 'var(--border-rose)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface-soft)';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.company_name}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {item.role}
                    </div>
                    {item.next_action && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Action: {item.next_action}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: currentTab.isDateOverdue ? '#DC2626' : 'var(--text-primary)',
                        }}
                      >
                        {formatDate(item.date)}
                      </div>
                      {rel && (
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: rel.isOverdue ? '#DC2626' : rel.isToday ? '#D97706' : 'var(--text-muted)',
                          }}
                        >
                          {rel.text}
                        </div>
                      )}
                    </div>
                    {onSelectApplication && (
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
