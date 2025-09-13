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
    <div className={styles.container}>
      <div className={styles.mb4}>
        <h1 className={styles.mb3}>Find a Therapist</h1>
        <p className={styles.mb4}>
          Browse our network of licensed therapists currently accepting new
          clients.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className={styles.card} style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          }}
        >
          <div>
            <label
              htmlFor="search"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
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
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="specialization"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
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
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box',
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
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              Showing {filteredTherapists.length} of {therapists.length}{' '}
              therapists
            </span>
            {(searchTerm || specializationFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSpecializationFilter('');
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            )}
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
  );
};

export default TherapistsPage;
