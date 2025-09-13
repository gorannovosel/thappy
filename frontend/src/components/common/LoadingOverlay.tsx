import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from './LoadingOverlay.module.css';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  overlay?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
  overlay = true,
  className = '',
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className={`${styles.container} ${className}`}>
        {children}
        <div className={styles.overlay}>
          <div className={styles.content}>
            <LoadingSpinner size="large" color="primary" />
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.inline} ${className}`}>
      <LoadingSpinner size="medium" />
      {message && <span className={styles.inlineMessage}>{message}</span>}
    </div>
  );
};

export default LoadingOverlay;
