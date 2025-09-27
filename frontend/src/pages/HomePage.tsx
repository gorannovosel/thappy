import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/global.module.css';
import '../styles/responsive.css';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)',
          paddingTop: '80px',
          paddingBottom: '120px',
        }}
      >
        <div className={styles.container}>
          <div
            className="responsive-hero-grid"
            style={{
              alignItems: 'center',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {/* Left Content */}
            <div>
              <h1
                className="responsive-hero-title"
                style={{
                  fontWeight: '400',
                  marginBottom: '24px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                We haven't walked in your shoes.
                <br />
                But we have a well-worn pair just like them.
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '32px',
                  color: '#4a4a4a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                How do we know that you're full of questions about pediatric
                mental health when what you really want are answers? Because
                we've been there.
              </p>

              <Link
                to="/help"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '16px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#d97706')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#f59e0b')
                }
              >
                (888) 256-7545
              </Link>
            </div>

            {/* Right Illustration */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src="/mainpage_drawing.png"
                alt="Child illustration"
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Three Main Sections */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '80px 0',
        }}
      >
        <div className={styles.container}>
          <div
            className="responsive-cards-grid"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {/* Find Therapies Section */}
            <div className="text-center">
              <div
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '200px',
                  margin: '0 auto 24px auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/mainpage_drawing.png"
                  alt="Find Therapies"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3
                className="responsive-section-title"
                style={{
                  fontWeight: '400',
                  marginBottom: '12px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Find Therapies
              </h3>
              <h4
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Specialized care options
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Speech therapy and language development, occupational and
                physical therapy, educational and social support, psychology and
                behavioral therapy.
              </p>
              <Link
                to="/therapies"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#d97706')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#f59e0b')
                }
              >
                Explore Therapies
              </Link>
            </div>

            {/* Educational Articles Section */}
            <div className="text-center">
              <div
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '200px',
                  margin: '0 auto 24px auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/mainpage_drawing.png"
                  alt="Educational Articles"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3
                className="responsive-section-title"
                style={{
                  fontWeight: '400',
                  marginBottom: '12px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Educational Articles
              </h3>
              <h4
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Expert insights and resources
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Child development milestones, therapy techniques and activities,
                parenting strategies and support, educational resources and
                guides.
              </p>
              <Link
                to="/articles"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#d97706')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#f59e0b')
                }
              >
                Browse Articles
              </Link>
            </div>

            {/* Need Guidance Section */}
            <div className="text-center">
              <div
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '200px',
                  margin: '0 auto 24px auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/mainpage_drawing.png"
                  alt="Need Guidance"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <h3
                className="responsive-section-title"
                style={{
                  fontWeight: '400',
                  marginBottom: '12px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Need Guidance?
              </h3>
              <h4
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  marginBottom: '16px',
                  color: '#1a1a1a',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Professional support available
              </h4>
              <p
                style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                Free assessment of your child's needs, professional therapy
                recommendations, help finding specialists in your area, support
                throughout the therapy process.
              </p>
              <Link
                to="/help"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#d97706')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#f59e0b')
                }
              >
                Get Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
