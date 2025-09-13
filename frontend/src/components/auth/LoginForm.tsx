import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import styles from '../../styles/global.module.css';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear global error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      // Redirect to intended page or dashboard
      if (from === '/') {
        // Default dashboard based on user role will be handled by the auth context
        navigate('/dashboard');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Sign In</h1>
            <p className={styles.cardSubtitle}>
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
              {formErrors.email && (
                <div className={styles.errorMessage}>{formErrors.email}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
              {formErrors.password && (
                <div className={styles.errorMessage}>{formErrors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className={styles.btnPrimary}
              style={{ width: '100%', marginBottom: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.textCenter}>
            <p>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;