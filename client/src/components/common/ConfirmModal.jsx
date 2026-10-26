import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Application?',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmText = 'Delete Application',
  cancelText = 'Cancel',
  loading = false,
  isDestructive = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div
          style={{
            flexShrink: 0,
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isDestructive ? '#FEE2E2' : 'var(--bg-blush)',
            color: isDestructive ? '#DC2626' : 'var(--accent-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline"
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
