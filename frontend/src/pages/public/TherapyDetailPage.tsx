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
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);

  const therapyInfo = therapyId
    ? therapyDetails[therapyId as keyof typeof therapyDetails]
    : null;

  const { data, loading, error, execute } = useAsync(async () => {
    if (!therapyId) return [];
    const response = await therapistDiscoveryApi.getAcceptingTherapists();
    return response.therapists;
  });

  useEffect(() => {
    if (therapyId) {
      execute();
    }
  }, [therapyId, execute]);

  useEffect(() => {
    if (data) {
      // Filter therapists by specialization if needed
      // For now, showing all therapists
      setTherapists(data);
    }
  }, [data]);

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
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Link
          to="/therapies"
          style={{
            textDecoration: 'none',
            color: 'var(--color-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          ← Back to All Therapies
        </Link>
      </div>

      {/* Therapy Header */}
      <div
        className={styles.textCenter}
        style={{ marginBottom: 'var(--spacing-2xl)' }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
          {therapyInfo.icon}
        </div>
        <h1 className={styles.mb4}>{therapyInfo.title}</h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            maxWidth: '800px',
            margin: '0 auto',
            color: 'var(--color-text-secondary)',
          }}
        >
          {therapyInfo.description}
        </p>
      </div>

      {/* Detailed Information */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-2xl)',
        }}
      >
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>What This Therapy Helps With</h2>
          <div
            style={{
              whiteSpace: 'pre-line',
              color: 'var(--color-text-secondary)',
            }}
          >
            {therapyInfo.detailedInfo}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>When to Consider This Therapy</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {therapyInfo.whenNeeded}
          </p>
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <Link to="/help" className={styles.btnSecondary}>
              Get Professional Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Therapists List */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
          Available Therapists
        </h2>

        {loading && (
          <div className={styles.textCenter}>
            <LoadingSpinner />
            <p style={{ marginTop: 'var(--spacing-md)' }}>
              Loading therapists...
            </p>
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error.message || 'Failed to load therapists'}
          />
        )}

        {!loading && !error && therapists.length === 0 && (
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <p>No therapists are currently available for this specialty.</p>
            <Link to="/help" className={styles.btnPrimary}>
              Contact Us for Referrals
            </Link>
          </div>
        )}

        {therapists.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {therapists.map(therapist => (
              <TherapistCard key={therapist.user_id} therapist={therapist} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <h2 className={styles.cardTitle}>Ready to Get Started?</h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          Take the next step in supporting your child's development.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/register" className={styles.btnPrimary}>
            Register to Connect
          </Link>
          <Link to="/help" className={styles.btnSecondary}>
            Need Guidance?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TherapyDetailPage;
