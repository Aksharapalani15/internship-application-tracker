import React from 'react';
import { Eye, Edit2, Trash2, ExternalLink, Calendar, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency, getRelativeDeadline } from '../../utils/formatters';
import { APPLICATION_STATUSES } from '../../utils/constants';

export default function ApplicationCards({
  applications = [],
  pagination = {},
  onChangePage,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { page = 1, totalPages = 1, hasNextPage = false, hasPrevPage = false, totalRecords = 0 } = pagination;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {applications.map((app) => {
          const rel = getRelativeDeadline(app.application_deadline);
          return (
            <div
              key={app.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
              }}
            >
              <div>
                {/* Header: Company & Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {app.company_name}
                      </h4>
                      {app.company_website && (
                        <a
                          href={app.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--text-muted)' }}
                          title="Visit company website"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {app.role}
                    </div>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                {/* Badges / Meta tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.75rem 0' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      backgroundColor: 'var(--bg-canvas-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {app.work_mode || 'Onsite'}
                  </span>
                  {app.internship_type && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        backgroundColor: 'var(--bg-blush)',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--accent-coral)',
                      }}
                    >
                      {app.internship_type}
                    </span>
                  )}
                  {app.stipend_amount !== null && app.stipend_amount !== undefined && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        backgroundColor: '#ECF7EE',
                        borderRadius: 'var(--radius-xs)',
                        color: '#196332',
                      }}
                    >
                      {formatCurrency(app.stipend_amount, app.stipend_currency)}
                    </span>
                  )}
                </div>

                {/* Location & Dates */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {app.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>{app.location}</span>
                    </div>
                  )}
                  {app.application_deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>Deadline: {formatDate(app.application_deadline)}</span>
                      {rel && (
                        <span style={{ fontWeight: 700, color: rel.isOverdue ? '#DC2626' : 'var(--accent-coral)' }}>
                          ({rel.text})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Next Action if present */}
                {app.next_action && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-surface-soft)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>Next: </strong>
                    {app.next_action}
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Status & Actions */}
              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app, e.target.value)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => onView(app)}
                    className="btn-ghost"
                    style={{ padding: '6px', borderRadius: 'var(--radius-xs)' }}
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(app)}
                    className="btn-ghost"
                    style={{ padding: '6px', borderRadius: 'var(--radius-xs)', color: 'var(--accent-coral)' }}
                    title="Edit application"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(app)}
                    className="btn-ghost"
                    style={{ padding: '6px', borderRadius: 'var(--radius-xs)', color: '#DC2626' }}
                    title="Delete application"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} items)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => onChangePage(page - 1)}
              disabled={!hasPrevPage}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePage(page + 1)}
              disabled={!hasNextPage}
              className="btn btn-outline btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
