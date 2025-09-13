import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/global.module.css';

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.mb4}>
        <h1 className={styles.mb3}>Therapist Dashboard</h1>
        <p className={styles.mb4}>
          Welcome back, {user?.email}! Manage your practice here.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Profile</h2>
            <p className={styles.cardSubtitle}>
              Manage your professional information and credentials
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btnPrimary}>
              View Profile
            </button>
            <button className={styles.btnSecondary}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Client Status</h2>
            <p className={styles.cardSubtitle}>
              Manage your availability for new clients
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span>Accepting New Clients:</span>
            <button className={styles.btnSecondary}>
              Configure
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Clients</h2>
            <p className={styles.cardSubtitle}>
              View and manage your current client list
            </p>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            No clients assigned yet
          </p>
          <button className={styles.btnSecondary}>
            Manage Clients
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Appointments</h2>
            <p className={styles.cardSubtitle}>
              View and manage your scheduled sessions
            </p>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            No appointments scheduled
          </p>
          <button className={styles.btnSecondary}>
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;