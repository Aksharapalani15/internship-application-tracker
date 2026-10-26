import React from 'react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeMap = {
    sm: { diameter: '18px', border: '2.5px' },
    md: { diameter: '32px', border: '3.5px' },
    lg: { diameter: '48px', border: '4.5px' },
  };

  const { diameter, border } = sizeMap[size] || sizeMap.md;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.85rem',
      padding: '2rem',
      color: 'var(--text-secondary)'
    }}>
      <div
        className="spinner"
        style={{
          width: diameter,
          height: diameter,
          border: `${border} solid var(--bg-rose)`,
          borderTopColor: 'var(--accent-coral)',
          borderRadius: '50%',
        }}
      />
      {message && (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
}
