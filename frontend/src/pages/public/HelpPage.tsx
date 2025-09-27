import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';

const HelpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    childAge: '',
    concerns: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.textCenter}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>
            ✅
          </div>
          <h1 className={styles.mb4}>Thank You!</h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            We have received your request for help. Our team will contact you
            within 24 hours.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  childAge: '',
                  concerns: '',
                  message: '',
                });
              }}
              className={styles.btnSecondary}
            >
              Submit Another Request
            </button>
            <Link to="/" className={styles.btnPrimary}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.container}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-2xl)',
            padding: 'var(--spacing-2xl) 0',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              margin: '0 auto var(--spacing-lg) auto',
            }}
          >
            <img
              src="/mainpage_drawing.png"
              alt="Child illustration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '700',
              lineHeight: '1.2',
              marginBottom: 'var(--spacing-md)',
              color: '#1f2937',
              fontFamily: 'var(--font-family-display)',
            }}
          >
            Zatražite pomoć
          </h1>
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              color: '#4b5563',
              marginBottom: 'var(--spacing-lg)',
              fontWeight: '500',
            }}
          >
            Ne znate što vam treba?
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: '1.6',
              color: '#4b5563',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Naš stručan tim će vam pomoći pronaći pravu terapiju za vaše dijete.
            Kontaktirajte nas za besplatnu konsultaciju i savjete.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--spacing-2xl)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
          {/* Contact Information */}
          <div>
            <div
              className={styles.card}
              style={{ marginBottom: 'var(--spacing-xl)' }}
            >
              <h2 className={styles.cardTitle}>Nazovite nas</h2>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-md)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📞</span>
                  <div>
                    <div
                      style={{
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: 'var(--font-size-lg)',
                      }}
                    >
                      +385 1 234 5678
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      Ponedjeljak - Petak: 8:00 - 18:00
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-md)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📧</span>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      help@thappy.hr
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      Odgovaramo u roku 24 sata
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      Zagreb, Hrvatska
                    </div>
                    <div
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      Dostupno i online
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius)',
                  marginTop: 'var(--spacing-lg)',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--font-size-base)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  Hitni slučajevi
                </h3>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                    margin: 0,
                  }}
                >
                  Za hitne slučajeve kontaktirajte svog liječnika ili pozovite
                  194 (Hitna pomoć).
                </p>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Kako možemo pomoći?</h2>
              <ul
                style={{
                  color: 'var(--color-text-secondary)',
                  paddingLeft: 'var(--spacing-lg)',
                }}
              >
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  Besplatna procjena potreba vašeg djeteta
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  Preporuke za odgovarajuće terapije
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  Pomoć u pronalaženju stručnjaka u vašoj okolini
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  Informacije o financiranju terapija
                </li>
                <li>Podrška kroz proces terapije</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Pošaljite nam upit</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Vaše ime *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email adresa *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Broj telefona
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="childAge" className={styles.label}>
                    Dob djeteta
                  </label>
                  <select
                    id="childAge"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Odaberite dob</option>
                    <option value="0-2">0-2 godine</option>
                    <option value="3-5">3-5 godina</option>
                    <option value="6-8">6-8 godina</option>
                    <option value="9-12">9-12 godina</option>
                    <option value="13-18">13-18 godina</option>
                    <option value="18+">18+ godina</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="concerns" className={styles.label}>
                    Područje zabrinutosti
                  </label>
                  <select
                    id="concerns"
                    name="concerns"
                    value={formData.concerns}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Odaberite područje</option>
                    <option value="speech">Govor i jezik</option>
                    <option value="motor">Motoričke vještine</option>
                    <option value="social">Socijalne vještine</option>
                    <option value="learning">Učenje i obrazovanje</option>
                    <option value="behavior">Ponašanje</option>
                    <option value="sensory">Senzorna obrada</option>
                    <option value="other">Ostalo</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Opišite vašu situaciju *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    rows={5}
                    placeholder="Molimo opišite što vas brine i kako možemo pomoći..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Šalje se...' : 'Pošaljite upit'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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
            Trebate brzu pomoć?
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
            Istražite naše resurse ili se registrirajte za pristup stručnjacima.
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
              to="/therapies"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                padding: '14px 28px',
              }}
            >
              Pregledaj terapije
            </Link>
            <Link
              to="/articles"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                padding: '14px 28px',
              }}
            >
              Edukacijski sadržaji
            </Link>
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
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e =>
                (e.currentTarget.style.backgroundColor = '#d97706')
              }
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor = '#f59e0b')
              }
            >
              Registriraj se
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpPage;
