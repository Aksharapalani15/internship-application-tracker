import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const safeStatus = status || 'Saved';

  const isSmall = size === 'sm';

  return (
    <span
      className={`status-badge status-${safeStatus}`}
      style={{
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.7rem',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
      }}
    >
      <span className="status-badge-dot" />
      <span>{safeStatus}</span>
    </span>
  );
}
