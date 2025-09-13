import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/global.module.css';

const HomePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textCenter}>
        <h1 className={styles.mb4}>Welcome to Thappy</h1>
        <p className={styles.mb5}>
          Connect with licensed therapists and manage your therapy journey.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          <Link to="/login" className={styles.btnPrimary}>
            Sign In
          </Link>
          <Link to="/register" className={styles.btnSecondary}>
            Get Started
          </Link>
        </div>

        <div>
          <Link to="/therapists" className={styles.btnSecondary}>
            Browse Therapists
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
