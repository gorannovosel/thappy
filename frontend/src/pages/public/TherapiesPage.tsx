import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Footer from '../../components/Footer';
import { therapyApi } from '../../services/therapy';
import styles from '../../styles/global.module.css';
import { TherapyResponse } from '../../types/api';

const TherapiesPage: React.FC = () => {
  const [therapies, setTherapies] = useState<TherapyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapies = async () => {
      try {
        setLoading(true);
        const response = await therapyApi.getTherapies(true);
        setTherapies(response.therapies);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load therapies'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTherapies();
  }, []);

  if (loading) {
    return (
      <div>
        <div className={styles.container}>
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={styles.container}>
          <ErrorMessage message={error} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        {/* Header Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--spacing-2xl)',
            alignItems: 'center',
            marginBottom: 'var(--spacing-2xl)',
            padding: 'var(--spacing-xl) 0',
          }}
        >
          {/* Left Content */}
          <div>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: 'var(--spacing-lg)',
                color: '#1f2937',
                fontFamily: 'var(--font-family-display)',
              }}
            >
              Find Therapies for Your Child
            </h1>
          </div>

          {/* Right Image */}
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)',
            }}
          >
            <div
              style={{
                width: '250px',
                height: '250px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/playtime.png"
                alt="Child playing with toys"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>

        {/* Therapy Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          {therapies.map((therapy, index) => {
            // Exact colors from Brightline design
            const colorSchemes = [
              { bg: '#F3D525', text: '#000000' }, // Yellow - Psychological Testing
              { bg: '#5B3A89', text: '#FFFFFF' }, // Purple - General Therapy
              { bg: '#9FD5D1', text: '#000000' }, // Mint - Anxiety Program
              { bg: '#1D3F5F', text: '#FFFFFF' }, // Navy - OCD Program
              { bg: '#EC8936', text: '#FFFFFF' }, // Orange - ADHD Program
              { bg: '#457F6C', text: '#FFFFFF' }, // Teal Green - Disruptive Behaviors
            ];

            const colorScheme = colorSchemes[index % colorSchemes.length];
            const backgroundColor = colorScheme.bg;
            const textColor = colorScheme.text;

            return (
              <div
                key={therapy.id}
                style={{
                  backgroundColor,
                  borderRadius: '6px',
                  padding: '24px 20px',
                  color: textColor,
                  position: 'relative',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'none',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: '400',
                    marginBottom: '8px',
                    borderBottom: `1.5px solid ${textColor}`,
                    paddingBottom: '8px',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    lineHeight: '1.2',
                  }}
                >
                  {therapy.title}
                </h2>

                <ul
                  style={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    flexGrow: 1,
                    lineHeight: '1.5',
                    paddingLeft: '16px',
                    listStyle: 'none',
                  }}
                >
                  {therapy.short_description
                    .split(' • ')
                    .filter(s => s)
                    .map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: '8px',
                          fontSize: '13px',
                          fontFamily:
                            '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          fontWeight: '300',
                          position: 'relative',
                          paddingLeft: '12px',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '0.5em',
                            width: '4px',
                            height: '4px',
                            backgroundColor: textColor,
                            borderRadius: '50%',
                          }}
                        ></span>
                        {item.trim()}
                      </li>
                    ))}
                </ul>

                <Link
                  to={`/therapies/${therapy.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: textColor,
                    textDecoration: 'none',
                    fontWeight: '400',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 'auto',
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {therapy.id.replace(/-/g, ' ').toUpperCase()} →
                </Link>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: 'var(--spacing-2xl)',
            marginTop: 'var(--spacing-2xl)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-md)',
              color: '#1f2937',
              fontFamily: 'var(--font-family-display)',
            }}
          >
            Need Help Choosing?
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: '#4b5563',
              marginBottom: 'var(--spacing-lg)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-lg) auto',
              lineHeight: '1.6',
            }}
          >
            Not sure which therapy is right for your child? Our team can help
            you understand your options and find the best path forward.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
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
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e =>
                (e.currentTarget.style.backgroundColor = '#d97706')
              }
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor = '#f59e0b')
              }
            >
              Get Professional Guidance
            </Link>
            <Link
              to="/therapists"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                padding: '14px 28px',
              }}
            >
              Browse All Therapists
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TherapiesPage;
