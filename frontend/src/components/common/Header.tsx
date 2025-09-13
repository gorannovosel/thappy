import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/global.module.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    return user.role === 'client' ? '/client/dashboard' : '/therapist/dashboard';
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-header)'
    }}>
      <div className={styles.container}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <Link
            to="/"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
              textDecoration: 'none'
            }}
          >
            Thappy
          </Link>

          <nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/therapists" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
                Find Therapists
              </Link>

              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={styles.btnSecondary}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {user?.email}
                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                  </button>

                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-md)',
                      minWidth: '200px',
                      zIndex: 1000,
                    }}>
                      <div style={{ padding: '0.5rem 0' }}>
                        <Link
                          to={getDashboardRoute()}
                          style={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            color: 'var(--color-text-primary)',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          style={{
                            display: 'block',
                            padding: '0.5rem 1rem',
                            textDecoration: 'none',
                            color: 'var(--color-text-primary)',
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                          }}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className={styles.btnSecondary}>
                    Sign In
                  </Link>
                  <Link to="/register" className={styles.btnPrimary}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;