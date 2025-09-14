import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { therapistDiscoveryApi } from '../../services/therapistDiscovery';
import TherapistCard from '../../components/public/TherapistCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import styles from '../../styles/global.module.css';
import type { TherapistProfile } from '../../types/api';

const therapyDetails = {
  logoped: {
    title: 'Logoped (Speech Therapy)',
    icon: '🗣️',
    description:
      'Speech and language therapy is essential for children who have difficulties with communication, speech clarity, language comprehension, or expression.',
    detailedInfo: `
      Speech therapy can help with:
      • Articulation disorders (difficulty pronouncing sounds)
      • Language delays (difficulty understanding or using language)
      • Fluency disorders (stuttering)
      • Voice disorders
      • Social communication difficulties
      • Swallowing difficulties
    `,
    whenNeeded:
      'Consider speech therapy if your child has trouble being understood, uses fewer words than peers, or struggles with social communication.',
  },
  radna: {
    title: 'Radna terapija (Occupational Therapy)',
    icon: '✋',
    description:
      'Occupational therapy helps children develop the skills needed for daily activities, school performance, and independent living.',
    detailedInfo: `
      Occupational therapy can help with:
      • Fine motor skills (writing, cutting, buttoning)
      • Gross motor coordination and balance
      • Sensory processing difficulties
      • Self-care skills (dressing, eating, hygiene)
      • Visual-motor integration
      • Attention and concentration
    `,
    whenNeeded:
      'Consider occupational therapy if your child struggles with daily activities, has coordination difficulties, or sensory sensitivities.',
  },
  'edukacijsko-rehabilitacijski': {
    title: 'Edukacijsko-rehabilitacijski rad',
    icon: '📚',
    description:
      'Educational rehabilitation provides specialized support for children with learning difficulties and developmental delays.',
    detailedInfo: `
      Educational rehabilitation can help with:
      • Reading and writing difficulties
      • Mathematical concept understanding
      • Attention and concentration problems
      • Memory and cognitive processing
      • Study skills and organization
      • Academic confidence building
    `,
    whenNeeded:
      'Consider educational rehabilitation if your child struggles academically, has learning disabilities, or needs specialized educational support.',
  },
  socijalna: {
    title: 'Socijalna terapija (Social Therapy)',
    icon: '👥',
    description:
      'Social therapy focuses on developing interpersonal skills and emotional regulation abilities.',
    detailedInfo: `
      Social therapy can help with:
      • Social interaction skills
      • Emotional regulation and coping strategies
      • Friendship building and maintenance
      • Conflict resolution
      • Understanding social cues
      • Building self-confidence
    `,
    whenNeeded:
      'Consider social therapy if your child has difficulty making friends, managing emotions, or understanding social situations.',
  },
  psiholog: {
    title: 'Psihološka podrška (Psychology)',
    icon: '🧠',
    description:
      'Psychological support provides counseling and therapy for emotional, behavioral, and mental health concerns.',
    detailedInfo: `
      Psychological support can help with:
      • Anxiety and depression
      • Behavioral difficulties
      • Trauma and grief processing
      • ADHD and attention difficulties
      • Autism spectrum support
      • Family relationship issues
    `,
    whenNeeded:
      'Consider psychological support if your child shows signs of emotional distress, behavioral challenges, or mental health concerns.',
  },
  fizio: {
    title: 'Fizioterapija (Physical Therapy)',
    icon: '🏃',
    description:
      'Physical therapy improves mobility, strength, balance, and gross motor skills through therapeutic exercises.',
    detailedInfo: `
      Physical therapy can help with:
      • Gross motor skill development
      • Balance and coordination
      • Muscle strength and endurance
      • Posture improvement
      • Mobility and movement patterns
      • Recovery from injuries
    `,
    whenNeeded:
      'Consider physical therapy if your child has movement difficulties, balance issues, or needs to improve gross motor skills.',
  },
};

const TherapyDetailPage: React.FC = () => {
  const { therapyId } = useParams<{ therapyId: string }>();
  // Remove backend dependency - show static content for now
  const [showTherapists] = useState(false); // Set to false to avoid backend calls

  const therapyInfo = therapyId
    ? therapyDetails[therapyId as keyof typeof therapyDetails]
    : null;

  // Comment out API calls to avoid backend dependency
  // const { data, loading, error, execute } = useAsync(async () => {
  //   if (!therapyId) return [];
  //   const response = await therapistDiscoveryApi.getAcceptingTherapists();
  //   return response.therapists;
  // });

  // useEffect(() => {
  //   if (therapyId) {
  //     execute();
  //   }
  // }, [therapyId, execute]);

  // useEffect(() => {
  //   if (data) {
  //     // Filter therapists by specialization if needed
  //     // For now, showing all therapists
  //     setTherapists(data);
  //   }
  // }, [data]);

  if (!therapyId || !therapyInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.textCenter}>
          <h1>Therapy Type Not Found</h1>
          <p>The requested therapy type could not be found.</p>
          <Link to="/therapies" className={styles.btnPrimary}>
            Back to Therapies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Link
            to="/therapies"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              textDecoration: 'none',
              color: '#f59e0b',
              fontSize: 'var(--font-size-base)',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fef3c7';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to All Therapies
          </Link>
        </div>

        {/* Hero Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'center',
          marginBottom: 'var(--spacing-2xl)',
          padding: 'var(--spacing-xl) 0'
        }}>
          {/* Left Content */}
          <div>
            <div style={{
              fontSize: '4rem',
              marginBottom: 'var(--spacing-md)'
            }}>
              {therapyInfo.icon}
            </div>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: 'var(--spacing-lg)',
              color: '#1f2937',
              fontFamily: 'var(--font-family-display)'
            }}>
              {therapyInfo.title}
            </h1>
            <p style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: '1.6',
              color: '#4b5563',
              maxWidth: '500px'
            }}>
              {therapyInfo.description}
            </p>
          </div>

          {/* Right Image */}
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-lg)'
          }}>
            <div style={{
              width: '250px',
              height: '250px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/playtime.png"
                alt="Child illustration"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-2xl)',
        }}>
          {/* What This Therapy Helps With - Yellow Card */}
          <div style={{
            backgroundColor: '#E6D536',
            borderRadius: '12px',
            padding: 'var(--spacing-xl)',
            color: '#1f2937',
            position: 'relative',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-md)',
              borderBottom: '2px solid #1f2937',
              paddingBottom: 'var(--spacing-xs)',
              display: 'inline-block',
            }}>
              What This Therapy Helps With
            </h2>
            <div style={{
              whiteSpace: 'pre-line',
              flexGrow: 1,
              lineHeight: '1.6'
            }}>
              {therapyInfo.detailedInfo}
            </div>
          </div>

          {/* When to Consider - Purple Card */}
          <div style={{
            backgroundColor: '#7C3AED',
            borderRadius: '12px',
            padding: 'var(--spacing-xl)',
            color: 'white',
            position: 'relative',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: 'var(--spacing-md)',
              borderBottom: '2px solid white',
              paddingBottom: 'var(--spacing-xs)',
              display: 'inline-block',
            }}>
              When to Consider This Therapy
            </h2>
            <p style={{
              marginBottom: 'var(--spacing-lg)',
              flexGrow: 1,
              lineHeight: '1.6'
            }}>
              {therapyInfo.whenNeeded}
            </p>
            <Link
              to="/help"
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
              GET PROFESSIONAL ASSESSMENT →
            </Link>
          </div>
        </div>

      {/* Therapists Section - Simplified without backend dependency */}
      {showTherapists && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
            Find Specialized Therapists
          </h2>
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <h3>Ready to Connect with Therapists?</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Browse our network of qualified {therapyInfo?.title.toLowerCase()} specialists.
            </p>
            <Link to="/therapists" className={styles.btnPrimary}>
              Browse All Therapists
            </Link>
          </div>
        </div>
      )}

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
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: '#4b5563',
            marginBottom: 'var(--spacing-lg)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-lg) auto',
            lineHeight: '1.6'
          }}>
            Take the next step in supporting your child's development.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
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
              Register to Connect
            </Link>
            <Link
              to="/help"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                padding: '14px 28px'
              }}
            >
              Need Guidance?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyDetailPage;
