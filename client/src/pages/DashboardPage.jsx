import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardApi } from '../api/dashboardApi';
import { applicationsApi } from '../api/applicationsApi';
import StatsOverview from '../components/dashboard/StatsOverview';
import ConversionCards from '../components/dashboard/ConversionCards';
import ActivityChart from '../components/dashboard/ActivityChart';
import DeadlinesWidget from '../components/dashboard/DeadlinesWidget';
import ApplicationDetailModal from '../components/applications/ApplicationDetailModal';
import ApplicationFormModal from '../components/applications/ApplicationFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage({ onOpenAddModal }) {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [deadlines, setDeadlines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit Modal State
  const [editingApp, setEditingApp] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activityRes, deadlinesRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivity(),
        dashboardApi.getUpcomingDeadlines(),
      ]);

      setStats(statsRes?.data || null);
      setActivity(activityRes?.data || []);
      setDeadlines(deadlinesRes?.data || null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSelectDeadlineApplication = async (appId) => {
    setDetailLoading(true);
    try {
      const res = await applicationsApi.getApplicationById(appId);
      if (res?.data?.application) {
        setSelectedApp(res.data.application);
        setIsDetailOpen(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load application details');
    } finally {
      setDetailLoading(false);
    }
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
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleEditSubmit = async (payload) => {
    if (!editingApp) return;
    await applicationsApi.updateApplication(editingApp.id, payload);
    toast.success('Application updated successfully');
    setIsEditOpen(false);
    setEditingApp(null);
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your internship pipeline..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '520px', margin: '2rem auto' }}>
        <h3 style={{ fontSize: '1.125rem', color: '#DC2626', marginBottom: '0.5rem' }}>
          Unable to Load Dashboard
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {error}
        </p>
        <button type="button" onClick={fetchDashboardData} className="btn btn-primary">
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="animate-fade-in">
      {/* Welcome Hero Banner */}
      <div
        style={{
          padding: '1.5rem 1.75rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FDF6F4 100%)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-coral)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            <Sparkles size={15} /> Application Pipeline
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Intern Tracker'}!
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Today is {todayFormatted}. Here is an overview of your active applications and next actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Application</span>
          </button>
          <Link to="/applications" className="btn btn-outline">
            <span>View All Applications</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* 1. Stats Overview Cards */}
      <StatsOverview stats={stats} />

      {/* 2. Conversion Metrics Row */}
      <ConversionCards stats={stats} />

      {/* 3. Deadlines & Monthly Velocity Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        <DeadlinesWidget
          deadlines={deadlines}
          onSelectApplication={handleSelectDeadlineApplication}
        />
        <ActivityChart activity={activity} />
      </div>

      {/* Application Detail Modal */}
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
        onDelete={async (app) => {
          if (window.confirm(`Are you sure you want to delete ${app.company_name}?`)) {
            await applicationsApi.deleteApplication(app.id);
            toast.success('Application deleted');
            setIsDetailOpen(false);
            setSelectedApp(null);
            fetchDashboardData();
          }
        }}
        onStatusChange={handleQuickStatusChange}
      />

      {/* Application Edit Modal */}
      <ApplicationFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingApp(null);
        }}
        initialData={editingApp}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
