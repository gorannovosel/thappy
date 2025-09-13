import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Sorry, we couldn't find the page you're looking for. The page may have
          been moved, deleted, or you may have entered an incorrect URL.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryButton}>
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className={styles.secondaryButton}
          >
            Go Back
          </button>
        </div>

        <div className={styles.suggestions}>
          <h3>You might also want to:</h3>
          <ul>
            <li>
              <Link to="/login">Sign in to your account</Link>
            </li>
            <li>
              <Link to="/register">Create a new account</Link>
            </li>
            <li>
              <Link to="/therapists">Browse available therapists</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
