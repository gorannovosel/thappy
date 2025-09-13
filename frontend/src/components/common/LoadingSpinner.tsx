import React from 'react';
import styles from '../../styles/global.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  className = '',
}) => {
  const sizeMap = {
    small: { width: '16px', height: '16px' },
    medium: { width: '20px', height: '20px' },
    large: { width: '24px', height: '24px' },
  };

  return (
    <div
      className={`${styles.loadingSpinner} ${className}`}
      style={sizeMap[size]}
      aria-label="Loading..."
    />
  );
};

export default LoadingSpinner;