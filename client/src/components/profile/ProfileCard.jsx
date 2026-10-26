import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { profileApi } from '../../api/profileApi';
import { formatDate } from '../../utils/formatters';
import { User, Mail, Calendar, Save, CheckCircle2 } from 'lucide-react';

export default function ProfileCard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await profileApi.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      if (res?.data?.profile) {
        updateUser(res.data.profile);
        toast.success('Your profile has been updated successfully');
      }
    } catch (err) {
      if (err.status === 409) {
        setErrors({ email: 'This email address is already registered to another account' });
        toast.error('This email is already in use');
      } else {
        toast.error(err.message || 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        {/* Header Avatar and Basic Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-blush)',
              color: 'var(--accent-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              border: '2px solid var(--border-rose)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.name}
            </h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {user?.email}
            </div>
            {user?.created_at && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Member since {formatDate(user.created_at)}
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Full Name</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                maxLength={100}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Email Address</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                maxLength={255}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
            <span className="form-hint">Used for signing in and session authentication</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
