import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { clientProfileApi } from '../../services/clientProfile';
import { ClientProfile } from '../../types/api';
import CreateProfileForm from '../../components/client/CreateProfileForm';
import EditProfileForm from '../../components/client/EditProfileForm';
import styles from '../../styles/global.module.css';

type ViewMode = 'dashboard' | 'create-profile' | 'edit-profile';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientProfileApi.getProfile();
      setProfile(response.profile);
    } catch (error) {
      // 404 means profile doesn't exist, which is expected for new users
      if (error instanceof Error && error.message.includes('not found')) {
        setProfile(null);
      } else {
        setError(
          error instanceof Error ? error.message : 'Failed to load profile'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSuccess = (updatedProfile: ClientProfile) => {
    setProfile(updatedProfile);
    setViewMode('dashboard');
  };

  if (viewMode === 'create-profile') {
    return (
      <div className={styles.container}>
        <CreateProfileForm
          onSuccess={handleProfileSuccess}
          onCancel={() => setViewMode('dashboard')}
        />
      </div>
    );
  }

  if (viewMode === 'edit-profile' && profile) {
    return (
      <div className={styles.container}>
        <EditProfileForm
          profile={profile}
          onSuccess={handleProfileSuccess}
          onCancel={() => setViewMode('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mb4}>
        <h1 className={styles.mb3}>Client Dashboard</h1>
        <p className={styles.mb4}>
          Welcome back, {user?.email}! Manage your therapy journey here.
        </p>
      </div>

      {error && (
        <div className={styles.error} style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Profile</h2>
            <p className={styles.cardSubtitle}>
              Manage your personal information and contact details
            </p>
          </div>

          {loading ? (
            <p>Loading profile...</p>
          ) : profile ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>Name:</strong> {profile.first_name}{' '}
                  {profile.last_name}
                </p>
                {profile.phone && (
                  <p>
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                )}
                {profile.emergency_contact && (
                  <p>
                    <strong>Emergency Contact:</strong>{' '}
                    {profile.emergency_contact}
                  </p>
                )}
                {profile.date_of_birth && (
                  <p>
                    <strong>Date of Birth:</strong>{' '}
                    {new Date(profile.date_of_birth).toLocaleDateString()}
                  </p>
                )}
                {profile.therapist_id && (
                  <p>
                    <strong>Therapist Assigned:</strong> Yes
                  </p>
                )}
              </div>
              <button
                className={styles.btnSecondary}
                onClick={() => setViewMode('edit-profile')}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  marginBottom: '1rem',
                }}
              >
                You haven't created your profile yet. Create one to get started.
              </p>
              <button
                className={styles.btnPrimary}
                onClick={() => setViewMode('create-profile')}
              >
                Create Profile
              </button>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Therapist</h2>
            <p className={styles.cardSubtitle}>
              Connect with your assigned therapist
            </p>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            No therapist assigned yet
          </p>
          <button className={styles.btnSecondary}>Find Therapist</button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Appointments</h2>
            <p className={styles.cardSubtitle}>
              View and manage your upcoming sessions
            </p>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            No appointments scheduled
          </p>
          <button className={styles.btnSecondary}>Schedule Session</button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
