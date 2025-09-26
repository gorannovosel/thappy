import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { therapistDiscoveryApi } from '../../services/therapistDiscovery';
import TherapistCard from '../../components/public/TherapistCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';
import type { TherapistProfile } from '../../types/api';

const therapyDetails = {
  'psychological-testing': {
    title: 'Psychological testing',
    icon: '🧠',
    description: 'Recognizing that something feels different is one thing. Finally figuring out what your child needs is another.',
    detailedInfo: `
      Psychological testing can assess:
      • Autism spectrum conditions
      • Learning differences and disabilities
      • Giftedness and school readiness
      • Memory and cognitive skills
      • Attention and executive functioning
      • Emotional and behavioral patterns
    `,
    whenNeeded:
      'Consider psychological testing if your child shows signs of learning differences, developmental concerns, or if you need clarity about their cognitive and emotional functioning.',
  },
  'general-therapy': {
    title: 'General Therapy and Psychiatry',
    icon: '💜',
    description:
      'Comprehensive mental health support addressing a wide range of emotional, behavioral, and psychological challenges through therapy and, when appropriate, medication management.',
    detailedInfo: `
      General therapy can help with:
      • Persistent low mood, lack of motivation, withdrawal
      • Trauma and stress-related issues
      • Physical symptoms without an identified medical cause
      • Sustained difficulties with everyday tasks
      • Depression and mood disorders
      • General mental health support
    `,
    whenNeeded:
      'Consider general therapy if your child experiences persistent emotional difficulties, unexplained physical symptoms, trauma-related issues, or struggles with daily functioning.',
  },
  'anxiety-program': {
    title: 'Anxiety Program',
    icon: '💙',
    description:
      'Specialized treatment for anxiety disorders, helping children manage worries, fears, and physical symptoms while building coping skills and confidence.',
    detailedInfo: `
      The anxiety program addresses:
      • Worries and fears, difficulty concentrating
      • Physical symptoms (like racing heart)
      • Feeling nervous, restless, edgy, afraid, or fearful
      • Avoidance of things they need or want to do
      • Social anxiety and phobias
      • Panic attacks and generalized anxiety
    `,
    whenNeeded:
      'Consider the anxiety program if your child experiences excessive worry, physical symptoms of anxiety, avoids activities due to fear, or has difficulty functioning due to anxiety.',
  },
  'ocd-program': {
    title: 'OCD Program',
    icon: '🌊',
    description:
      'Specialized treatment for obsessive-compulsive disorder, using evidence-based approaches to help children manage intrusive thoughts and compulsive behaviors.',
    detailedInfo: `
      The OCD program helps with:
      • Repeated or ritualized behaviors driven by anxiety, fear, or disgust
      • Overdoing things more than is needed
      • Fear of not doing something "just right"
      • Avoiding things they need or want to do
      • Intrusive thoughts about any number of topics
      • Compulsive checking, counting, or arranging
    `,
    whenNeeded:
      'Consider the OCD program if your child engages in repetitive behaviors, has intrusive thoughts that cause distress, or spends excessive time on rituals that interfere with daily life.',
  },
  'adhd-program': {
    title: 'ADHD Program',
    icon: '🧡',
    description:
      'Comprehensive support for attention-deficit/hyperactivity disorder, combining behavioral strategies, skill-building, and when appropriate, medication management.',
    detailedInfo: `
      The ADHD program addresses:
      • Difficulties paying attention
      • Difficulty sitting still
      • Distracting or disruptive behaviors
      • Impulsive actions
      • Organization and time management challenges
      • Academic and social difficulties
    `,
    whenNeeded:
      'Consider the ADHD program if your child has trouble focusing, acts impulsively, struggles to sit still, or has difficulty with organization and completing tasks.',
  },
  'disruptive-behaviors': {
    title: 'Disruptive Behaviors Program',
    icon: '💚',
    description:
      'Targeted interventions for children who display challenging behaviors, focusing on understanding triggers and developing positive coping strategies.',
    detailedInfo: `
      The program addresses:
      • Tantrums and other behavioral upsets
      • Impulsive actions
      • Troubling behaviors at school or with friends
      • Difficulty following directions
      • Aggression and defiance
      • Emotional dysregulation
    `,
    whenNeeded:
      'Consider this program if your child has frequent tantrums, difficulty following rules, aggressive behaviors, or struggles with peer relationships due to behavioral challenges.',
  },
};

const TherapyDetailPage: React.FC = () => {
  const { therapyId } = useParams<{ therapyId: string }>();
  const [showTherapists] = useState(false);
  const therapyInfo = therapyId
    ? therapyDetails[therapyId as keyof typeof therapyDetails]
    : null;

  if (!therapyInfo) {
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
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)',
        paddingTop: '80px',
        paddingBottom: '120px'
      }}>
        <div className={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '400',
                lineHeight: '1.2',
                marginBottom: '24px',
                color: '#1a1a1a',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                {therapyInfo.title}
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#4a4a4a',
                lineHeight: '1.6',
                marginBottom: '32px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                Recognizing that something feels different is one thing. Finally figuring out what your child needs is another.
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
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                (888) 256-7545
              </Link>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/mainpage_drawing.png"
                alt="Psychological testing illustration"
                style={{
                  width: '300px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* When Is Testing Right Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '80px 0'
      }}>
        <div className={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '60px',
            alignItems: 'flex-start',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Left Image with Orange Card */}
            <div style={{
              position: 'relative'
            }}>
              <div style={{
                backgroundColor: '#f59e0b',
                borderRadius: '8px',
                padding: '24px 20px',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '400',
                    color: 'white',
                    marginBottom: '16px',
                    lineHeight: '1.3',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}>
                    When is<br />
                    {therapyInfo.title.toLowerCase()}<br />
                    right?
                  </h3>
                  <p style={{
                    fontSize: '11px',
                    color: 'white',
                    opacity: 0.9,
                    lineHeight: '1.4',
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}>
                    "{therapyInfo.title} isn't something about what's wrong with your child or family, it's to find ways to ensure everyone gets the support they need."
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/playtime.png"
                    alt="Child with therapist"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div>
              {/* Info Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '4px',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="#1a1a1a"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      color: '#1a1a1a',
                      lineHeight: '1.5',
                      margin: 0,
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Autism or other developmental concerns
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '4px',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="#1a1a1a"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      color: '#1a1a1a',
                      lineHeight: '1.5',
                      margin: 0,
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Learning disorders or concerns about academic performance
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '4px',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="#1a1a1a"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      color: '#1a1a1a',
                      lineHeight: '1.5',
                      margin: 0,
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Patterns of executive functioning, memory, or other cognitive skills
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '4px',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="#1a1a1a"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      color: '#1a1a1a',
                      lineHeight: '1.5',
                      margin: 0,
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Readiness to start school, academic strengths, and giftedness
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What to Expect Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '80px 0'
      }}>
        <div className={styles.container}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '400',
            marginBottom: '16px',
            color: '#1a1a1a',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            What to expect
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#4a4a4a',
            lineHeight: '1.6',
            marginBottom: '60px',
            maxWidth: '800px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            Our testing is done in person and involves the following:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '40px',
            maxWidth: '1000px'
          }}>
            {/* Left Image */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              <img
                src="/mindfulness.png"
                alt="Testing process"
                style={{
                  width: '250px',
                  height: 'auto',
                  borderRadius: '12px',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Right Content */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></span>
                  <p style={{
                    fontSize: '15px',
                    color: '#1a1a1a',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}>
                    <strong>An initial testing appointment and possibly additional testing</strong>
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></span>
                  <p style={{
                    fontSize: '15px',
                    color: '#1a1a1a',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}>
                    <strong>In a follow-up session, you'll receive test results, impressions and diagnoses, and a written report with detailed clinical recommendations, behavior observations on the day(s) of testing, specific test scores and performance, interpretation of results, and other considerations</strong>
                  </p>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '50%',
                    marginTop: '6px',
                    flexShrink: 0
                  }}></span>
                  <p style={{
                    fontSize: '15px',
                    color: '#1a1a1a',
                    lineHeight: '1.6',
                    margin: 0,
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  }}>
                    <strong>Information gathering (with parent permission) from important adults in your child's life, like teachers and other care providers, to ensure a well-rounded view of your child</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div style={{
        backgroundColor: '#1E3A5F',
        padding: '80px 0',
        color: 'white'
      }}>
        <div className={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '400',
                marginBottom: '24px',
                color: 'white',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                Hear what thappy<br />
                parents have to say
              </h2>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: 'white',
                marginBottom: '32px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontStyle: 'italic'
              }}>
                "We have had the best experience with thappy. My daughter has been able to use the techniques given by her therapist and it really has helped her. I would recommend thappy to anyone whose child could benefit from therapy and learning coping mechanisms for everyday life. Our family and her teachers have seen a dramatic change and she looks forward to every session."
              </p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/bedtime.png"
                alt="Happy family"
                style={{
                  width: '300px',
                  height: 'auto',
                  borderRadius: '12px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Get in Touch Section */}
      <div style={{
        backgroundColor: '#9DDAD5',
        padding: '80px 0'
      }}>
        <div className={styles.container}>
          <div style={{
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '400',
              marginBottom: '16px',
              color: '#1a1a1a',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              Get in touch with us
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#1a1a1a',
              lineHeight: '1.6',
              marginBottom: '32px',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              It's okay if you don't know the root of the issue or are unsure what to say. We're here to listen — and we'd love to hear from you.
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
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            >
              (888) 256-7545
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TherapyDetailPage;