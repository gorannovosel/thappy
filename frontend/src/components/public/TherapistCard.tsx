import React from 'react';
import { TherapistProfile } from '../../types/api';
import styles from './TherapistCard.module.css';

interface TherapistCardProps {
  therapist: TherapistProfile;
  onContact?: (therapist: TherapistProfile) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({
  therapist,
  onContact,
}) => {
  const handleContact = () => {
    if (onContact) {
      onContact(therapist);
    }
  };

  const formatSpecializations = (specializations: string[]) => {
    if (specializations.length === 0) return 'General Practice';
    if (specializations.length === 1) return specializations[0];
    if (specializations.length === 2) return specializations.join(' • ');
    if (specializations.length === 3) return specializations.join(' • ');
    return `${specializations.slice(0, 2).join(' • ')} +${specializations.length - 2} more`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>
          Dr. {therapist.first_name} {therapist.last_name}
        </h3>
        {therapist.accepting_clients && (
          <span className={styles.acceptingBadge}>Accepting Clients</span>
        )}
      </div>

      <div className={styles.credentials}>
        <span className={styles.license}>
          License: {therapist.license_number}
        </span>
      </div>

      {therapist.specializations.length > 0 && (
        <div className={styles.specializations}>
          <h4 className={styles.sectionTitle}>Specializations</h4>
          <p className={styles.specializationText}>
            {formatSpecializations(therapist.specializations)}
          </p>
        </div>
      )}

      {therapist.bio && (
        <div className={styles.bio}>
          <h4 className={styles.sectionTitle}>About</h4>
          <p className={styles.bioText}>
            {therapist.bio.length > 150
              ? `${therapist.bio.substring(0, 150)}...`
              : therapist.bio}
          </p>
        </div>
      )}

      <div className={styles.contact}>
        {therapist.phone && (
          <div className={styles.contactInfo}>
            <span className={styles.contactLabel}>Phone:</span>
            <span className={styles.contactValue}>{therapist.phone}</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.contactButton}
          onClick={handleContact}
          disabled={!therapist.accepting_clients}
        >
          {therapist.accepting_clients
            ? 'Contact Therapist'
            : 'Not Accepting Clients'}
        </button>
      </div>

      <div className={styles.footer}>
        <span className={styles.joinDate}>
          Member since {new Date(therapist.created_at).getFullYear()}
        </span>
      </div>
    </div>
  );
};

export default TherapistCard;
