import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import ConfirmDialog from './ConfirmDialog';
import styles from '../../styles/global.module.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Enable session timeout for authenticated users
  useSessionTimeout({
    timeoutDuration: 30 * 60 * 1000, // 30 minutes
    warningDuration: 5 * 60 * 1000, // Show warning 5 minutes before
  });

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    return user.role === 'client'
      ? '/client/dashboard'
      : '/therapist/dashboard';
  };

  return (
    <header
      style={{
        backgroundColor: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-header)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className={styles.container}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '80px',
          }}
        >
          <Link
            to="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#f59e0b',
              textDecoration: 'none',
              fontFamily: 'var(--font-family-display)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            thappy
            <span style={{ color: '#0ea5e9', fontSize: '1.2rem' }}>✨</span>
          </Link>

          <nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
              >
                <Link
                  to="/therapies"
                  style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                  }}
                >
                  Therapies
                </Link>

                <Link
                  to="/articles"
                  style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                  }}
                >
                  Articles
                </Link>

                <Link
                  to="/help"
                  style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                  }}
                >
                  Ask for help
                </Link>

                <Link
                  to="/therapists"
                  style={{
                    textDecoration: 'none',
                    color: '#374151',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                  }}
                >
                  Search
                </Link>
              </div>

              {/* Call Button */}
              <Link
                to="tel:+385-1-234-5678"
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '1rem',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#d97706')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#f59e0b')
                }
              >
                Call +385 1 234 5678
              </Link>

              {isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={styles.btnSecondary}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {user?.email}
                    <span style={{ fontSize: '0.75rem' }}>▼</span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      style={{
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
                      }}
                    >
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
                        <hr
                          style={{
                            margin: '0.5rem 0',
                            border: 'none',
                            borderTop: '1px solid var(--color-border)',
                          }}
                        />
                        <button
                          onClick={handleLogoutClick}
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
                  <Link
                    to="/login"
                    style={{
                      textDecoration: 'none',
                      color: '#374151',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: '600',
                      padding: '10px 20px',
                      marginRight: '1rem',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseOver={e =>
                      (e.currentTarget.style.backgroundColor = '#d97706')
                    }
                    onMouseOut={e =>
                      (e.currentTarget.style.backgroundColor = '#f59e0b')
                    }
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        type="default"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </header>
  );
};

export default Header;
