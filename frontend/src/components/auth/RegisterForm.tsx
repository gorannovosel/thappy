import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import styles from '../../styles/global.module.css';
import type { UserRole } from '../../types/api';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password && !errors.confirmPassword;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
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
      await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Redirect to appropriate dashboard based on role
      const dashboardRoute = formData.role === 'client' ? '/client/dashboard' : '/therapist/dashboard';
      navigate(dashboardRoute);
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Create Account</h1>
            <p className={styles.cardSubtitle}>
              Join Thappy to connect with therapists or offer your services.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.label}>
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="client">Client - Looking for therapy</option>
                <option value="therapist">Therapist - Providing services</option>
              </select>
            </div>

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
                placeholder="Choose a secure password"
                disabled={isLoading}
                required
              />
              {formErrors.password && (
                <div className={styles.errorMessage}>{formErrors.password}</div>
              )}
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Confirm your password"
                disabled={isLoading}
                required
              />
              {formErrors.confirmPassword && (
                <div className={styles.errorMessage}>{formErrors.confirmPassword}</div>
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
                  <LoadingSpinner size="small" /> Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={styles.textCenter}>
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-primary)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;