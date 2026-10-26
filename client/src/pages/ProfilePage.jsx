import React from 'react';
import ProfileCard from '../components/profile/ProfileCard';

export default function ProfilePage() {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account & Profile Settings
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Manage your account profile information and login email.
        </p>
      </div>

      <ProfileCard />
    </div>
  );
}
