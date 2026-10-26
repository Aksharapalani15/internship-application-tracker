import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { applicationsApi } from '../api/applicationsApi';
import FilterBar from '../components/applications/FilterBar';
import ApplicationTable from '../components/applications/ApplicationTable';
import ApplicationCards from '../components/applications/ApplicationCards';
import ApplicationFormModal from '../components/applications/ApplicationFormModal';
import ApplicationDetailModal from '../components/applications/ApplicationDetailModal';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Briefcase, Plus, RefreshCw } from 'lucide-react';

export default function ApplicationsPage({ isAddModalOpen, onCloseAddModal, onOpenAddModal }) {
  const toast = useToast();

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    work_mode: '',
    sortBy: 'created_at',
    order: 'DESC',
    page: 1,
    limit: 10,
  });

  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit Modal State
  const [editingApp, setEditingApp] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete Confirm Modal State
  const [deletingApp, setDeletingApp] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicationsApi.getApplications(filters);
      setApplications(res?.data || []);
      setPagination(res?.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load applications');
      toast.error(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 on filter/sort changes
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      work_mode: '',
      sortBy: 'created_at',
      order: 'DESC',
      page: 1,
      limit: 10,
    });
  };

  const handleCreateSubmit = async (payload) => {
    await applicationsApi.createApplication(payload);
    toast.success('Internship application created successfully');
    onCloseAddModal();
    fetchApplications();
  };

  const handleEditSubmit = async (payload) => {
    if (!editingApp) return;
    await applicationsApi.updateApplication(editingApp.id, payload);
    toast.success('Internship application updated successfully');
    setIsEditOpen(false);
    setEditingApp(null);
    fetchApplications();
  };

  const handleQuickStatusChange = async (app, newStatus) => {
    try {
      const payload = {
        company_name: app.company_name,
        role: app.role,
        description: app.description,
        company_website: app.company_website,
        application_url: app.application_url,
        location: app.location,
        work_mode: app.work_mode,
        internship_type: app.internship_type,
        stipend_amount: app.stipend_amount,
        stipend_currency: app.stipend_currency,
        duration: app.duration,
        application_deadline: app.application_deadline ? String(app.application_deadline).slice(0, 10) : null,
        date_applied: app.date_applied ? String(app.date_applied).slice(0, 10) : null,
        status: newStatus,
        notes: app.notes,
        next_action: app.next_action,
        follow_up_date: app.follow_up_date ? String(app.follow_up_date).slice(0, 10) : null,
      };

      const res = await applicationsApi.updateApplication(app.id, payload);
      toast.success(`Moved ${app.company_name} to ${newStatus}`);
      if (selectedApp && selectedApp.id === app.id) {
        setSelectedApp(res.data.application);
      }
      fetchApplications();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;
    setDeleteLoading(true);
    try {
      await applicationsApi.deleteApplication(deletingApp.id);
      toast.success(`Deleted application for ${deletingApp.company_name}`);
      setIsDeleteOpen(false);
      setDeletingApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.message || 'Failed to delete application');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Search and Filters Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalRecords={pagination.totalRecords || 0}
      />

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner message="Fetching applications..." />
      ) : error ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '520px', margin: '2rem auto' }}>
          <h3 style={{ fontSize: '1.125rem', color: '#DC2626', marginBottom: '0.5rem' }}>
            Unable to Load Applications
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {error}
          </p>
          <button type="button" onClick={fetchApplications} className="btn btn-primary">
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={filters.search || filters.status || filters.work_mode ? 'No matching applications found' : 'No applications tracked yet'}
          description={
            filters.search || filters.status || filters.work_mode
              ? 'Try adjusting your search terms or clearing status filters.'
              : 'Add your first internship application to start organizing deadlines, interviews, and offers!'
          }
          actionText={filters.search || filters.status || filters.work_mode ? null : 'Add Your First Application'}
          onAction={onOpenAddModal}
        />
      ) : viewMode === 'table' ? (
        <ApplicationTable
          applications={applications}
          pagination={pagination}
          onChangePage={(p) => handleFilterChange('page', p)}
          onView={(app) => {
            setSelectedApp(app);
            setIsDetailOpen(true);
          }}
          onEdit={(app) => {
            setEditingApp(app);
            setIsEditOpen(true);
          }}
          onDelete={(app) => {
            setDeletingApp(app);
            setIsDeleteOpen(true);
          }}
          onStatusChange={handleQuickStatusChange}
        />
      ) : (
        <ApplicationCards
          applications={applications}
          pagination={pagination}
          onChangePage={(p) => handleFilterChange('page', p)}
          onView={(app) => {
            setSelectedApp(app);
            setIsDetailOpen(true);
          }}
          onEdit={(app) => {
            setEditingApp(app);
            setIsEditOpen(true);
          }}
          onDelete={(app) => {
            setDeletingApp(app);
            setIsDeleteOpen(true);
          }}
          onStatusChange={handleQuickStatusChange}
        />
      )}

      {/* Add Application Modal */}
      <ApplicationFormModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Application Modal */}
      <ApplicationFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingApp(null);
        }}
        initialData={editingApp}
        onSubmit={handleEditSubmit}
      />

      {/* View Details Modal */}
      <ApplicationDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        onEdit={(app) => {
          setEditingApp(app);
          setIsEditOpen(true);
        }}
        onDelete={(app) => {
          setDeletingApp(app);
          setIsDeleteOpen(true);
        }}
        onStatusChange={handleQuickStatusChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingApp(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Internship Application?"
        message={`Are you sure you want to permanently delete the application for "${deletingApp?.company_name}" (${deletingApp?.role})? This action cannot be reversed.`}
        confirmText="Yes, Delete Record"
        loading={deleteLoading}
      />
    </div>
  );
}
