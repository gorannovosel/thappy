import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/global.module.css';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className={styles.container}>
        {/* Hero Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'center',
          marginBottom: 'var(--spacing-2xl)',
          minHeight: '500px'
        }}>
          {/* Left Content */}
          <div style={{ order: 1 }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: 'var(--spacing-xl)',
              color: '#1f2937',
              fontFamily: 'var(--font-family-display)'
            }}>
              Therapy services for children.
              Support for families like yours.
            </h1>

            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: '1.6',
              marginBottom: 'var(--spacing-2xl)',
              color: '#4b5563',
              maxWidth: '500px'
            }}>
              You know your child better than anyone. But when it comes to finding
              the right therapy support, it's easy to feel unsure. Our qualified
              therapists deliver the specialized care you've been looking for.
            </p>

            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-base)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Get Started
              </Link>

              <Link
                to="/help"
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-base)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Illustration Area */}
          <div style={{
            order: 2,
            textAlign: 'center',
            padding: 'var(--spacing-xl)'
          }}>
            <div style={{
              width: '300px',
              height: '300px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/mainpage_drawing.png"
                alt="Child illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <p style={{
              marginTop: 'var(--spacing-lg)',
              color: '#6b7280',
              fontSize: 'var(--font-size-sm)',
              fontStyle: 'italic'
            }}>
              Specialized care for every child's unique needs
            </p>
          </div>
        </div>

        {/* Three Main Sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          {/* Therapies Section */}
          <div
            style={{
              backgroundColor: '#E6D536',
              borderRadius: '12px',
              padding: 'var(--spacing-xl)',
              color: '#1f2937',
              position: 'relative',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-md)',
                  borderBottom: '2px solid #1f2937',
                  paddingBottom: 'var(--spacing-xs)',
                  display: 'inline-block',
                }}
              >
                Find Therapies
              </h2>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                flexGrow: 1,
              }}
            >
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Speech therapy and language development
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Occupational and physical therapy
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Educational and social support
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Psychology and behavioral therapy
              </li>
            </ul>

            <Link
              to="/therapies"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#1f2937',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: 'auto',
              }}
            >
              EXPLORE THERAPIES →
            </Link>
          </div>

          {/* Topics Section */}
          <div
            style={{
              backgroundColor: '#7C3AED',
              borderRadius: '12px',
              padding: 'var(--spacing-xl)',
              color: 'white',
              position: 'relative',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-md)',
                  borderBottom: '2px solid white',
                  paddingBottom: 'var(--spacing-xs)',
                  display: 'inline-block',
                }}
              >
                Educational Topics
              </h2>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                flexGrow: 1,
              }}
            >
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Child development milestones
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Therapy techniques and activities
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Parenting strategies and support
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Educational resources and guides
              </li>
            </ul>

            <Link
              to="/topics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: 'auto',
              }}
            >
              BROWSE ARTICLES →
            </Link>
          </div>

          {/* Ask for Help Section */}
          <div
            style={{
              backgroundColor: '#A7E2E8',
              borderRadius: '12px',
              padding: 'var(--spacing-xl)',
              color: '#1f2937',
              position: 'relative',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-md)',
                  borderBottom: '2px solid #1f2937',
                  paddingBottom: 'var(--spacing-xs)',
                  display: 'inline-block',
                }}
              >
                Need Guidance?
              </h2>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: 'var(--spacing-lg)',
                flexGrow: 1,
              }}
            >
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Free assessment of your child's needs
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Professional therapy recommendations
              </li>
              <li
                style={{
                  marginBottom: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Help finding specialists in your area
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span
                  style={{
                    marginRight: 'var(--spacing-xs)',
                    fontWeight: 'bold',
                  }}
                >
                  •
                </span>
                Support throughout the therapy process
              </li>
            </ul>

            <Link
              to="/help"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#1f2937',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginTop: 'auto',
              }}
            >
              GET HELP →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'var(--spacing-2xl)',
          padding: 'var(--spacing-xl) 0',
        }}
      >
        <div className={styles.container}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-xl)',
            }}
          >
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Thappy</h3>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                Supporting families in finding the right therapy services for
                their children.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link
                    to="/therapies"
                    style={{
                      textDecoration: 'none',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Therapy Services
                  </Link>
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link
                    to="/therapists"
                    style={{
                      textDecoration: 'none',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Find Therapists
                  </Link>
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link
                    to="/help"
                    style={{
                      textDecoration: 'none',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Get Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <Link
                    to="/topics"
                    style={{
                      textDecoration: 'none',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Educational Articles
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <hr
            style={{
              margin: 'var(--spacing-xl) 0 var(--spacing-md) 0',
              border: 'none',
              borderTop: '1px solid var(--color-border)',
            }}
          />
          <div className={styles.textCenter}>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                margin: 0,
              }}
            >
              © 2024 Thappy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
