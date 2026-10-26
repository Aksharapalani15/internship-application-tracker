import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency, getRelativeDeadline } from '../../utils/formatters';
import { APPLICATION_STATUSES } from '../../utils/constants';
import {
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  CheckSquare,
} from 'lucide-react';

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  if (!application) return null;

  const rel = getRelativeDeadline(application.application_deadline);
  const relFollowUp = getRelativeDeadline(application.follow_up_date);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application.company_name}
      subtitle={application.role}
      maxWidth="680px"
    >
      <div>
        {/* Top bar: Status, quick status change, and Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <StatusBadge status={application.status} />
            <select
              value={application.status}
              onChange={(e) => onStatusChange(application, e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              {APPLICATION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Move to: {st}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(application);
              }}
              className="btn btn-outline btn-sm"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(application);
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: '#DC2626' }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Briefcase size={13} /> Work Mode & Type
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {application.work_mode || 'Onsite'}
              {application.internship_type && ` • ${application.internship_type}`}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <DollarSign size={13} /> Stipend
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatCurrency(application.stipend_amount, application.stipend_currency)}
              {application.duration && ` • ${application.duration}`}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <MapPin size={13} /> Location
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {application.location || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Timeline / Dates */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            Timeline & Deadlines
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date Applied: </span>
              <strong>{formatDate(application.date_applied)}</strong>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Application Deadline: </span>
              <strong>{formatDate(application.application_deadline)}</strong>
              {rel && (
                <span style={{ marginLeft: '4px', color: rel.isOverdue ? '#DC2626' : 'var(--accent-coral)', fontSize: '0.75rem' }}>
                  ({rel.text})
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Follow-up Date: </span>
              <strong>{formatDate(application.follow_up_date)}</strong>
              {relFollowUp && (
                <span style={{ marginLeft: '4px', color: relFollowUp.isOverdue ? '#DC2626' : 'var(--accent-coral)', fontSize: '0.75rem' }}>
                  ({relFollowUp.text})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Next Action Box */}
        {application.next_action && (
          <div
            style={{
              padding: '0.9rem 1rem',
              backgroundColor: 'var(--bg-blush)',
              border: '1px solid var(--border-rose)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', color: 'var(--accent-coral)', fontWeight: 700, fontSize: '0.8125rem' }}>
              <CheckSquare size={15} /> Immediate Next Action
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {application.next_action}
            </div>
          </div>
        )}

        {/* Links */}
        {(application.company_website || application.application_url) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              External Links
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {application.company_website && (
                <a
                  href={application.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={13} />
                  <span>Company Website</span>
                </a>
              )}
              {application.application_url && (
                <a
                  href={application.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <ExternalLink size={13} />
                  <span>Job Posting URL</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              Personal Notes & Recruiter Context
            </h5>
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-soft)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                border: '1px solid var(--border-light)',
              }}
            >
              {application.notes}
            </div>
          </div>
        )}

        {/* Description */}
        {application.description && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              Job Description
            </h5>
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-soft)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                border: '1px solid var(--border-light)',
              }}
            >
              {application.description}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Created: {formatDate(application.created_at)}</span>
          <span>Last Updated: {formatDate(application.updated_at)}</span>
        </div>
      </div>
    </Modal>
  );
}
