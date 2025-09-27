import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '4rem 1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: '72rem',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f97316',
                marginBottom: '1.5rem',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              thappy
            </div>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1rem',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Supporting families in finding the right therapy services for
              their children.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
              }}
            >
              <a
                href="#"
                style={{
                  color: '#9ca3af',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#6b7280')}
                onMouseOut={e => (e.currentTarget.style.color = '#9ca3af')}
              >
                <span
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  Facebook
                </span>
                <svg
                  style={{ width: '20px', height: '20px' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                style={{
                  color: '#9ca3af',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#6b7280')}
                onMouseOut={e => (e.currentTarget.style.color = '#9ca3af')}
              >
                <span
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                  }}
                >
                  Twitter
                </span>
                <svg
                  style={{ width: '20px', height: '20px' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3
              style={{
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              What We Offer
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapies/psychological-testing"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Psychological Testing
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapies/general-therapy"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  General Therapy
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapies/adhd-program"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  ADHD Program
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapies/anxiety-program"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Anxiety Program
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapies/ocd-program"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  OCD Program
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              style={{
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Company
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/about"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  About Us
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/therapists"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Our Therapists
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/help"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              style={{
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Resources
            </h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>
                <Link
                  to="/articles"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Educational Articles
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="#"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a
                  href="#"
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#111827')}
                  onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            © 2024 Thappy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
