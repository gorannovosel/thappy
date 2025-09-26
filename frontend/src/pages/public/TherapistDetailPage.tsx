import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { therapistDiscoveryApi } from '../../services/therapistDiscovery';
import { TherapistProfile } from '../../types/api';
import styles from './TherapistDetailPage.module.css';

const TherapistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!id) {
        setError('No therapist ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await therapistDiscoveryApi.getTherapistById(id);
        setTherapist(data);
      } catch (err) {
        console.error('Error fetching therapist:', err);
        setError('Failed to load therapist details');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading therapist details...</div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Therapist Not Found</h2>
          <p>{error || 'The therapist you are looking for could not be found.'}</p>
          <Link to="/therapists" className={styles.backLink}>
            Back to therapists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/therapists" className={styles.breadcrumbLink}>Therapists</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>
            Dr. {therapist.first_name} {therapist.last_name}
          </span>
        </div>

        {/* Back Navigation */}
        <div className={styles.backNav}>
          <Link to="/therapists" className={styles.backButton}>
            <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to therapists
          </Link>
        </div>

        {/* Main Profile Section */}
        <div className={styles.mainContent}>
          {/* Left Column - Photo and Basic Info */}
          <div className={styles.leftColumn}>
            <div className={styles.profileCard}>
              <div className={styles.profileImage}>
                <img
                  src="/professional-therapist-portrait.jpg"
                  alt={`Dr. ${therapist.first_name} ${therapist.last_name}`}
                />
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileHeader}>
                  <h1 className={styles.profileName}>
                    Dr. {therapist.first_name} {therapist.last_name}
                  </h1>
                  {therapist.accepting_clients && (
                    <span className={styles.acceptingBadge}>Accepting clients</span>
                  )}
                </div>

                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <svg className={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    License: {therapist.license_number}
                  </div>
                  <div className={styles.detailItem}>
                    <svg className={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Member since {new Date(therapist.created_at).getFullYear()}
                  </div>
                  {therapist.phone && (
                    <div className={styles.detailItem}>
                      <svg className={styles.detailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {therapist.phone}
                    </div>
                  )}
                </div>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.scheduleButton}
                    disabled={!therapist.accepting_clients}
                  >
                    {therapist.accepting_clients
                      ? 'Schedule consultation'
                      : 'Not accepting clients'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className={styles.rightColumn}>
            {/* About Section */}
            {therapist.bio && (
              <div className={styles.infoCard}>
                <h2 className={styles.sectionTitle}>
                  About Dr. {therapist.last_name}
                </h2>
                <p className={styles.bioText}>{therapist.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {therapist.specializations && therapist.specializations.length > 0 && (
              <div className={styles.infoCard}>
                <h2 className={styles.sectionTitle}>Areas of Expertise</h2>
                <div className={styles.specializationsList}>
                  {therapist.specializations.map((specialization, index) => (
                    <span key={index} className={styles.specializationBadge}>
                      {specialization}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.contactInfo}>
                {therapist.phone ? (
                  <p>Phone: {therapist.phone}</p>
                ) : (
                  <p>Contact information not available</p>
                )}
                <p className={styles.contactNote}>
                  All sessions are conducted via secure video call.
                </p>
              </div>
              <button
                className={styles.bookButton}
                disabled={!therapist.accepting_clients}
              >
                {therapist.accepting_clients
                  ? 'Book your first session'
                  : 'Not accepting new clients'}
              </button>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className={styles.whyChooseSection}>
          <div className={styles.whyChooseContent}>
            <h2 className={styles.whyChooseTitle}>Why families choose our therapists</h2>
            <p className={styles.whyChooseSubtitle}>
              Our therapists are carefully selected and trained to provide the highest quality care.
            </p>
            <div className={styles.whyChooseGrid}>
              <div className={styles.whyChooseItem}>
                <div className={styles.whyChooseIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3>Licensed & Experienced</h3>
                <p>
                  All our therapists are licensed professionals with specialized training in mental health.
                </p>
              </div>
              <div className={styles.whyChooseItem}>
                <div className={styles.whyChooseIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3>Warm & Caring</h3>
                <p>
                  We create a safe, supportive environment where you feel comfortable opening up.
                </p>
              </div>
              <div className={styles.whyChooseItem}>
                <div className={styles.whyChooseIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>Evidence-Based</h3>
                <p>
                  Our treatments are backed by research and proven to be effective.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetailPage;