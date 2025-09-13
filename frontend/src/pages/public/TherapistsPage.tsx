import React from 'react';
import styles from '../../styles/global.module.css';

const TherapistsPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mb4}>
        <h1 className={styles.mb3}>Find a Therapist</h1>
        <p className={styles.mb4}>
          Browse our network of licensed therapists currently accepting new clients.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.textCenter}>
          <div className={styles.loadingSpinner} style={{ margin: '2rem auto' }}></div>
          <p>Loading therapists...</p>
        </div>
      </div>
    </div>
  );
};

export default TherapistsPage;