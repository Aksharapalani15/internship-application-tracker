import React from 'react';
import { Search, X, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { APPLICATION_STATUSES, WORK_MODES, ALLOWED_SORT_COLUMNS } from '../../utils/constants';

export default function FilterBar({
  filters,
  onChange,
  onReset,
  viewMode,
  onToggleViewMode,
  totalRecords = 0,
}) {
  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.work_mode ||
    filters.startDate ||
    filters.endDate;

  return (
    <div
      className="card"
      style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Search and primary controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem', paddingRight: filters.search ? '2.4rem' : '0.85rem' }}
            placeholder="Search company or role title..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange('search', '')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '2px',
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div style={{ width: '150px' }}>
          <select
            className="form-select"
            value={filters.status || ''}
            onChange={(e) => onChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {APPLICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Work Mode Filter */}
        <div style={{ width: '130px' }}>
          <select
            className="form-select"
            value={filters.work_mode || ''}
            onChange={(e) => onChange('work_mode', e.target.value)}
          >
            <option value="">All Modes</option>
            {WORK_MODES.map((wm) => (
              <option key={wm} value={wm}>
                {wm}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Field */}
        <div style={{ width: '160px' }}>
          <select
            className="form-select"
            value={filters.sortBy || 'created_at'}
            onChange={(e) => onChange('sortBy', e.target.value)}
          >
            {ALLOWED_SORT_COLUMNS.map((col) => (
              <option key={col.value} value={col.value}>
                Sort: {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Toggle */}
        <button
          type="button"
          onClick={() => onChange('order', filters.order === 'ASC' ? 'DESC' : 'ASC')}
          className="btn btn-outline btn-sm"
          title={`Currently sorting ${filters.order || 'DESC'}`}
          style={{ height: '38px', padding: '0 0.75rem' }}
        >
          <ArrowUpDown size={15} />
          <span>{filters.order === 'ASC' ? 'Ascending' : 'Descending'}</span>
        </button>

        {/* View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-canvas-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <button
            type="button"
            onClick={() => onToggleViewMode('table')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              color: viewMode === 'table' ? 'var(--accent-coral)' : 'var(--text-muted)',
              backgroundColor: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Table View"
          >
            <List size={17} />
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('cards')}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              color: viewMode === 'cards' ? 'var(--accent-coral)' : 'var(--text-muted)',
              backgroundColor: viewMode === 'cards' ? 'var(--bg-surface)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Cards View"
          >
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      {/* Secondary filter details & status summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          paddingTop: '0.35rem',
          borderTop: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          Showing <strong>{totalRecords}</strong> matching {totalRecords === 1 ? 'application' : 'applications'}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-coral)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <X size={13} />
            <span>Reset all filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
