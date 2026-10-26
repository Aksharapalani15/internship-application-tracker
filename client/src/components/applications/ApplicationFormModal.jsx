import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { APPLICATION_STATUSES, WORK_MODES, CURRENCIES } from '../../utils/constants';

export default function ApplicationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const isEditing = !!initialData;

  const defaultFormState = {
    company_name: '',
    role: '',
    description: '',
    company_website: '',
    application_url: '',
    location: '',
    work_mode: 'Onsite',
    internship_type: '',
    stipend_amount: '',
    stipend_currency: 'INR',
    duration: '',
    application_deadline: '',
    date_applied: '',
    status: 'Applied',
    notes: '',
    next_action: '',
    follow_up_date: '',
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        role: initialData.role || '',
        description: initialData.description || '',
        company_website: initialData.company_website || '',
        application_url: initialData.application_url || '',
        location: initialData.location || '',
        work_mode: initialData.work_mode || 'Onsite',
        internship_type: initialData.internship_type || '',
        stipend_amount: initialData.stipend_amount !== null && initialData.stipend_amount !== undefined ? initialData.stipend_amount : '',
        stipend_currency: initialData.stipend_currency || 'INR',
        duration: initialData.duration || '',
        application_deadline: initialData.application_deadline ? String(initialData.application_deadline).slice(0, 10) : '',
        date_applied: initialData.date_applied ? String(initialData.date_applied).slice(0, 10) : '',
        status: initialData.status || 'Applied',
        notes: initialData.notes || '',
        next_action: initialData.next_action || '',
        follow_up_date: initialData.follow_up_date ? String(initialData.follow_up_date).slice(0, 10) : '',
      });
    } else {
      setFormData(defaultFormState);
    }
    setFormErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    } else if (formData.company_name.trim().length > 150) {
      errors.company_name = 'Company name cannot exceed 150 characters';
    }

    if (!formData.role.trim()) {
      errors.role = 'Role title is required';
    } else if (formData.role.trim().length > 150) {
      errors.role = 'Role title cannot exceed 150 characters';
    }

    if (formData.company_website && formData.company_website.trim()) {
      try {
        new URL(formData.company_website.trim());
      } catch {
        errors.company_website = 'Must be a valid web URL (e.g., https://example.com)';
      }
    }

    if (formData.application_url && formData.application_url.trim()) {
      try {
        new URL(formData.application_url.trim());
      } catch {
        errors.application_url = 'Must be a valid web URL (e.g., https://example.com)';
      }
    }

    if (formData.stipend_amount !== '' && formData.stipend_amount !== null) {
      const num = Number(formData.stipend_amount);
      if (isNaN(num) || num < 0) {
        errors.stipend_amount = 'Stipend must be a non-negative number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Clean payload for backend (nullify empty strings)
    const payload = {
      company_name: formData.company_name.trim(),
      role: formData.role.trim(),
      description: formData.description.trim() || null,
      company_website: formData.company_website.trim() || null,
      application_url: formData.application_url.trim() || null,
      location: formData.location.trim() || null,
      work_mode: formData.work_mode || 'Onsite',
      internship_type: formData.internship_type.trim() || null,
      stipend_amount: formData.stipend_amount !== '' ? Number(formData.stipend_amount) : null,
      stipend_currency: formData.stipend_currency || 'INR',
      duration: formData.duration.trim() || null,
      application_deadline: formData.application_deadline || null,
      date_applied: formData.date_applied || null,
      status: formData.status || 'Applied',
      notes: formData.notes.trim() || null,
      next_action: formData.next_action.trim() || null,
      follow_up_date: formData.follow_up_date || null,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const backendErrors = {};
        err.errors.forEach((issue) => {
          backendErrors[issue.field] = issue.message;
        });
        setFormErrors(backendErrors);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Internship Application' : 'Add New Internship Application'}
      subtitle={isEditing ? `Update details for ${initialData?.company_name}` : 'Track a new opportunity in your pipeline'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Information */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Basic Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Company Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                className="form-input"
                placeholder="e.g. Google, Microsoft, Startup"
                value={formData.company_name}
                onChange={handleChange}
                maxLength={150}
              />
              {formErrors.company_name && <span className="form-error">{formErrors.company_name}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Role Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="role"
                className="form-input"
                placeholder="e.g. Software Engineering Intern"
                value={formData.role}
                onChange={handleChange}
                maxLength={150}
              />
              {formErrors.role && <span className="form-error">{formErrors.role}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Work Mode</label>
              <select
                name="work_mode"
                className="form-select"
                value={formData.work_mode}
                onChange={handleChange}
              >
                {WORK_MODES.map((wm) => (
                  <option key={wm} value={wm}>{wm}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Bengaluru, India or Remote"
                value={formData.location}
                onChange={handleChange}
                maxLength={150}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Status & Dates */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Status & Deadlines
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pipeline Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                {APPLICATION_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date Applied</label>
              <input
                type="date"
                name="date_applied"
                className="form-input"
                value={formData.date_applied}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="application_deadline"
                className="form-input"
                value={formData.application_deadline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Follow-up Date</label>
              <input
                type="date"
                name="follow_up_date"
                className="form-input"
                value={formData.follow_up_date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Compensation & Program Details */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Compensation & Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Stipend Amount</label>
              <input
                type="number"
                name="stipend_amount"
                className="form-input"
                placeholder="e.g. 50000"
                min="0"
                step="any"
                value={formData.stipend_amount}
                onChange={handleChange}
              />
              {formErrors.stipend_amount && <span className="form-error">{formErrors.stipend_amount}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Currency</label>
              <select
                name="stipend_currency"
                className="form-select"
                value={formData.stipend_currency}
                onChange={handleChange}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                className="form-input"
                placeholder="e.g. 3 months, 6 months"
                value={formData.duration}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Internship Type / Season</label>
              <input
                type="text"
                name="internship_type"
                className="form-input"
                placeholder="e.g. Summer 2025, Fall Co-op"
                value={formData.internship_type}
                onChange={handleChange}
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Section 4: URLs */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company Website URL</label>
              <input
                type="url"
                name="company_website"
                className="form-input"
                placeholder="https://company.com"
                value={formData.company_website}
                onChange={handleChange}
                maxLength={255}
              />
              {formErrors.company_website && <span className="form-error">{formErrors.company_website}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Job Posting / Application URL</label>
              <input
                type="url"
                name="application_url"
                className="form-input"
                placeholder="https://careers.company.com/job/123"
                value={formData.application_url}
                onChange={handleChange}
                maxLength={255}
              />
              {formErrors.application_url && <span className="form-error">{formErrors.application_url}</span>}
            </div>
          </div>
        </div>

        {/* Section 5: Action & Notes */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Next Action / Immediate Task</label>
            <input
              type="text"
              name="next_action"
              className="form-input"
              placeholder="e.g. Prepare system design, solve 2 DP LeetCode questions"
              value={formData.next_action}
              onChange={handleChange}
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Recruiter Context</label>
            <textarea
              name="notes"
              className="form-textarea"
              rows={3}
              placeholder="Recruiter contact, interview questions asked, referral info..."
              value={formData.notes}
              onChange={handleChange}
              maxLength={5000}
            />
          </div>
        </div>

        {/* Modal Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving Application...' : isEditing ? 'Update Application' : 'Save Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
