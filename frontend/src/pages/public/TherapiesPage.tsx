import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';

interface TherapyType {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const therapyTypes: TherapyType[] = [
  {
    id: 'logoped',
    title: 'Logoped (Speech Therapy)',
    description:
      'Speech and language therapy helps children develop communication skills, improve speech clarity, and overcome language disorders.',
    icon: '🗣️',
  },
  {
    id: 'radna',
    title: 'Radna terapija (Occupational Therapy)',
    description:
      'Occupational therapy focuses on developing daily living skills, fine motor skills, and helping children participate in everyday activities.',
    icon: '✋',
  },
  {
    id: 'edukacijsko-rehabilitacijski',
    title: 'Edukacijsko-rehabilitacijski rad',
    description:
      'Educational rehabilitation work supports children with learning difficulties and developmental delays through specialized educational approaches.',
    icon: '📚',
  },
  {
    id: 'socijalna',
    title: 'Socijalna terapija (Social Therapy)',
    description:
      'Social therapy helps children develop social skills, emotional regulation, and improve their interactions with others.',
    icon: '👥',
  },
  {
    id: 'psiholog',
    title: 'Psihološka podrška (Psychology)',
    description:
      'Psychological support provides counseling and therapy for emotional, behavioral, and mental health concerns in children.',
    icon: '🧠',
  },
  {
    id: 'fizio',
    title: 'Fizioterapija (Physical Therapy)',
    description:
      'Physical therapy helps improve mobility, strength, balance, and gross motor skills through therapeutic exercises and activities.',
    icon: '🏃',
  },
];

const TherapiesPage: React.FC = () => {
  return (
    <div>
      <div className={styles.container}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-2xl)',
          padding: 'var(--spacing-2xl) 0'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto var(--spacing-lg) auto'
          }}>
            <img
              src="/playtime.png"
              alt="Child playing with toys"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: 'var(--spacing-xl)',
            color: '#1f2937',
            fontFamily: 'var(--font-family-display)'
          }}>
            Find Therapies for Your Child
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            lineHeight: '1.6',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover the right therapy services to support your child's
            development. Each therapy type offers specialized support for
            different needs and challenges.
          </p>
        </div>

        {/* Therapy Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          {therapyTypes.map((therapy, index) => {
            const colors = ['#E6D536', '#7C3AED', '#A7E2E8'];
            const backgroundColor = colors[index % 3];
            const textColor = backgroundColor === '#7C3AED' ? 'white' : '#1f2937';

            return (
              <div
                key={therapy.id}
                style={{
                  backgroundColor,
                  borderRadius: '12px',
                  padding: 'var(--spacing-xl)',
                  color: textColor,
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
                      borderBottom: `2px solid ${textColor}`,
                      paddingBottom: 'var(--spacing-xs)',
                      display: 'inline-block',
                    }}
                  >
                    {therapy.title}
                  </h2>
                </div>

                <p
                  style={{
                    marginBottom: 'var(--spacing-lg)',
                    flexGrow: 1,
                    lineHeight: '1.6'
                  }}
                >
                  {therapy.description}
                </p>

                <Link
                  to={`/therapies/${therapy.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: textColor,
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 'auto',
                  }}
                >
                  LEARN MORE & FIND THERAPISTS →
                </Link>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: 'var(--spacing-2xl)',
          marginTop: 'var(--spacing-2xl)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-md)',
            color: '#1f2937',
            fontFamily: 'var(--font-family-display)'
          }}>
            Need Help Choosing?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: '#4b5563',
            marginBottom: 'var(--spacing-lg)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-lg) auto',
            lineHeight: '1.6'
          }}>
            Not sure which therapy is right for your child? Our team can help you
            understand your options and find the best path forward.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
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
              Get Professional Guidance
            </Link>
            <Link
              to="/therapists"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                padding: '14px 28px'
              }}
            >
              Browse All Therapists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapiesPage;
