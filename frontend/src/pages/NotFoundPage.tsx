import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/global.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textCenter}>
        <h1 className={styles.mb3}>404 - Page Not Found</h1>
        <p className={styles.mb4}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className={styles.btnPrimary}>
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;