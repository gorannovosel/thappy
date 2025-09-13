import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/global.module.css';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.mb4}>
        <h1 className={styles.mb3}>Client Dashboard</h1>
        <p className={styles.mb4}>
          Welcome back, {user?.email}! Manage your therapy journey here.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Profile</h2>
            <p className={styles.cardSubtitle}>
              Manage your personal information and contact details
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
            <h2 className={styles.cardTitle}>My Therapist</h2>
            <p className={styles.cardSubtitle}>
              Connect with your assigned therapist
            </p>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            No therapist assigned yet
          </p>
          <button className={styles.btnSecondary}>
            Find Therapist
          </button>
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
          <button className={styles.btnSecondary}>
            Schedule Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;