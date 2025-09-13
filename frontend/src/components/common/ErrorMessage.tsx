import React from 'react';
import styles from '../../styles/global.module.css';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  className = '',
}) => {
  const alertClass = type === 'error' ? styles.alertError : styles.alertWarning;

  return (
    <div className={`${alertClass} ${className}`} role="alert">
      {message}
    </div>
  );
};

export default ErrorMessage;
