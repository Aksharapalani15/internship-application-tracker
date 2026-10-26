import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Get started by creating your first record or adjust your search filters.',
  actionText,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-subtle)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-blush)',
          color: 'var(--accent-coral)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(224, 122, 95, 0.12)',
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', marginBottom: actionText ? '1.25rem' : 0 }}>
        {description}
      </p>

      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
