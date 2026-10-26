import React from 'react';
import { Menu, Plus, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationsApi } from '../../api/applicationsApi';

export default function Navbar({ onToggleSidebar, onOpenAddModal, title = 'Dashboard' }) {
  const { user } = useAuth();
  const toast = useToast();

  const handleExportCsv = async () => {
    try {
      const csvText = await applicationsApi.exportCsv();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `internship-applications-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Internship applications exported successfully as CSV');
    } catch (err) {
      toast.error(err.message || 'Failed to export CSV');
    }
  };

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-hamburger"
          style={{
            display: 'none',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {title}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handleExportCsv}
          className="btn btn-outline btn-sm"
          title="Export applications to CSV"
        >
          <Download size={15} />
          <span className="export-label">Export CSV</span>
        </button>

        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Add Application</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-hamburger {
            display: flex !important;
          }
          header {
            padding: 0 1rem !important;
          }
          .export-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
