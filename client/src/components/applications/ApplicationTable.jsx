import React from 'react';
import { Eye, Edit2, Trash2, ExternalLink, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency, getRelativeDeadline } from '../../utils/formatters';
import { APPLICATION_STATUSES } from '../../utils/constants';

export default function ApplicationTable({
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
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Status</th>
              <th>Work Mode</th>
              <th>Stipend</th>
              <th>Dates</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const rel = getRelativeDeadline(app.application_deadline);
              return (
                <tr key={app.id}>
                  {/* Company & Role */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {app.company_name}
                        </span>
                        {app.company_website && (
                          <a
                            href={app.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                            title="Visit company website"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {app.role}
                      </span>
                      {app.location && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                          <MapPin size={11} /> {app.location}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status with quick status dropdown */}
                  <td>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                      <StatusBadge status={app.status} size="sm" />
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app, e.target.value)}
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 4px',
                          border: '1px solid var(--border-light)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-surface-soft)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                        title="Quick change status"
                      >
                        {APPLICATION_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Change to: {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Work Mode */}
                  <td>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {app.work_mode || 'Onsite'}
                    </span>
                    {app.internship_type && (
                      <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {app.internship_type}
                      </span>
                    )}
                  </td>

                  {/* Stipend */}
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatCurrency(app.stipend_amount, app.stipend_currency)}
                    </span>
                    {app.duration && (
                      <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {app.duration}
                      </span>
                    )}
                  </td>

                  {/* Dates */}
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {app.date_applied && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Applied: </span>
                          {formatDate(app.date_applied)}
                        </div>
                      )}
                      {app.application_deadline && (
                        <div style={{ marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                          <span style={{ fontWeight: rel?.isOverdue ? 700 : 500, color: rel?.isOverdue ? '#DC2626' : 'inherit' }}>
                            {formatDate(app.application_deadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => onView(app)}
                        className="btn-ghost"
                        style={{ padding: '6px', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)' }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(app)}
                        className="btn-ghost"
                        style={{ padding: '6px', borderRadius: 'var(--radius-xs)', color: 'var(--accent-coral)' }}
                        title="Edit Application"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(app)}
                        className="btn-ghost"
                        style={{ padding: '6px', borderRadius: 'var(--radius-xs)', color: '#DC2626' }}
                        title="Delete Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0.5rem',
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
