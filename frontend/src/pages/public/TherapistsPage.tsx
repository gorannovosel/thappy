import React, { useState, useEffect } from 'react';
import { TherapistProfile } from '../../types/api';
import { therapistDiscoveryApi } from '../../services/therapistDiscovery';
import TherapistCard from '../../components/public/TherapistCard';
import styles from '../../styles/global.module.css';

const TherapistsPage: React.FC = () => {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await therapistDiscoveryApi.getAcceptingTherapists();
      setTherapists(response.therapists);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load therapists'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (therapist: TherapistProfile) => {
    // This could open a modal, navigate to a contact form, or show contact info
    alert(
      `Contact Dr. ${therapist.first_name} ${therapist.last_name} at ${therapist.phone || 'See profile for contact information'}`
    );
  };

  // Get unique specializations for filter dropdown
  const allSpecializations = Array.from(
    new Set(therapists.flatMap(t => t.specializations))
  ).sort();

  // Filter therapists based on search and specialization
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch =
      searchTerm === '' ||
      `${therapist.first_name} ${therapist.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      therapist.specializations.some(spec =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (therapist.bio &&
        therapist.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialization =
      specializationFilter === '' ||
      therapist.specializations.includes(specializationFilter);

    return matchesSearch && matchesSpecialization;
  });

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
            Find a Therapist
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            lineHeight: '1.6',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Browse our network of licensed therapists currently accepting new
            clients.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-2xl)'
        }}>
          <div style={{
            display: 'grid',
            gap: 'var(--spacing-lg)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          }}>
            <div>
              <label
                htmlFor="search"
                style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                Search Therapists
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name, specialization, or bio..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-family-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div>
              <label
                htmlFor="specialization"
                style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-sm)',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                Filter by Specialization
              </label>
              <select
                id="specialization"
                value={specializationFilter}
                onChange={e => setSpecializationFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-family-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="">All Specializations</option>
                {allSpecializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || specializationFilter) && (
            <div style={{
              marginTop: 'var(--spacing-lg)',
              display: 'flex',
              gap: 'var(--spacing-sm)',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: 'var(--font-size-sm)',
                color: '#4b5563'
              }}>
                Showing {filteredTherapists.length} of {therapists.length} therapists
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSpecializationFilter('');
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: 'var(--font-size-sm)',
                  backgroundColor: 'white',
                  border: '2px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.card}>
          <div className={styles.textCenter}>
            <div
              className={styles.loadingSpinner}
              style={{ margin: '2rem auto' }}
            ></div>
            <p>Loading therapists...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.card}>
          <div className={styles.error} style={{ textAlign: 'center' }}>
            <p>{error}</p>
            <button
              onClick={loadTherapists}
              className={styles.btnSecondary}
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Therapists Grid */}
      {!loading && !error && (
        <>
          {filteredTherapists.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.textCenter}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {therapists.length === 0
                    ? 'No therapists are currently accepting new clients.'
                    : 'No therapists match your search criteria.'}
                </p>
                {(searchTerm || specializationFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSpecializationFilter('');
                    }}
                    className={styles.btnSecondary}
                    style={{ marginTop: '1rem' }}
                  >
                    View All Therapists
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              }}
            >
              {filteredTherapists.map(therapist => (
                <TherapistCard
                  key={therapist.user_id}
                  therapist={therapist}
                  onContact={handleContact}
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default TherapistsPage;
