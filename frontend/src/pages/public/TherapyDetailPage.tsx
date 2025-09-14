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
    title: 'Psychological Testing',
    icon: '🧠',
    description:
      'Comprehensive psychological assessments help identify your child\'s unique strengths, challenges, and learning profile to guide appropriate interventions.',
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
      'Targeted interventions for challenging behaviors, helping children develop self-control, emotional regulation, and positive social skills.',
    detailedInfo: `
      This program helps with:
      • Tantrums and other behavioral upsets
      • Impulsive actions
      • Troubling behaviors at school or with friends
      • Difficulty following directions
      • Aggression or defiance
      • Emotional dysregulation
    `,
    whenNeeded:
      'Consider this program if your child has frequent tantrums, difficulty following rules, aggressive behaviors, or struggles with peer relationships due to behavioral challenges.',
  },
  // Keep the old ones for backward compatibility
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
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fff 100%)',
        paddingTop: '60px',
        paddingBottom: '80px',
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
            {/* Left Content */}
            <div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '400',
                lineHeight: '1.2',
                marginBottom: '24px',
                color: '#1a1a1a',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                {therapyInfo.title.replace(' Program', '')}
                <br />
                {therapyInfo.title.includes('Program') ? 'Program' : ''}
              </h1>
              <p style={{
                fontSize: '18px',
                lineHeight: '1.6',
                color: '#4a4a4a',
                marginBottom: '32px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                {therapyInfo.description}
              </p>
              <Link
                to="/register"
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
                Get started today
              </Link>
            </div>

            {/* Right Illustration */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/playtime.png"
                alt="Therapy illustration"
                style={{
                  width: '400px',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* When is the Program Right Section */}
      <div style={{
        backgroundColor: '#FCE8B2',
        padding: '80px 0'
      }}>
        <div className={styles.container}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '60px',
            alignItems: 'start',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Left Image */}
            <div style={{
              backgroundColor: '#F59E0B',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '500',
                color: 'white',
                marginBottom: '20px',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                When is the {therapyInfo.title.split(' ')[0]}<br />
                Program right?
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'white',
                lineHeight: '1.6',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}>
                {therapyInfo.whenNeeded.split('.')[0]}.
              </p>
            </div>

            {/* Right Content - Bullet Points */}
            <div>
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '24px'
                }}>
                  <span style={{
                    fontSize: '24px',
                    marginRight: '16px',
                    marginTop: '-4px'
                  }}>✓</span>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Repeated or ritualized behaviors
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4a4a4a',
                      lineHeight: '1.5',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      {therapyInfo.detailedInfo.split('•')[1]?.trim() || 'Behaviors that are driven by anxiety, fear, or disgust and are difficult to stop.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '24px'
                }}>
                  <span style={{
                    fontSize: '24px',
                    marginRight: '16px',
                    marginTop: '-4px'
                  }}>🧩</span>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Overdoing things
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4a4a4a',
                      lineHeight: '1.5',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      {therapyInfo.detailedInfo.split('•')[2]?.trim() || 'More than is needed, reducing time and energy for other activities.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '24px'
                }}>
                  <span style={{
                    fontSize: '24px',
                    marginRight: '16px',
                    marginTop: '-4px'
                  }}>💭</span>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Intrusive thoughts
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4a4a4a',
                      lineHeight: '1.5',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      {therapyInfo.detailedInfo.split('•')[3]?.trim() || 'About any number of topics that cause anxiety, worry, shame, and other difficult emotions.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '24px',
                    marginRight: '16px',
                    marginTop: '-4px'
                  }}>🎯</span>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: '#1a1a1a',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      Fear of not doing something "just right"
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#4a4a4a',
                      lineHeight: '1.5',
                      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                    }}>
                      {therapyInfo.detailedInfo.split('•')[4]?.trim() || 'Or avoiding things they need or want to do.'}
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
            fontSize: '36px',
            fontWeight: '400',
            marginBottom: '16px',
            color: '#1a1a1a',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            What to expect
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#4a4a4a',
            lineHeight: '1.6',
            marginBottom: '60px',
            maxWidth: '800px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            Brightline's {therapyInfo.title} sessions can be held in person or virtually. We provide kids up to age 18 with symptom assessment, testing, diagnosis, and treatment including:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            maxWidth: '1000px'
          }}>
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px',
                  marginBottom: '12px',
                  fontSize: '20px'
                }}>
                  📋
                </span>
                <p style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}>
                  <strong>Evidence-based interventions</strong> like Exposure and Response Prevention (ERP) and Habit Reversal Training (HRT) for obsessive-compulsive disorders and related disorders like hoarding/saving hair pulling and excoriation (skin-picking), psychiatry, and medication management as needed.
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px',
                  marginBottom: '12px',
                  fontSize: '20px'
                }}>
                  📊
                </span>
                <p style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}>
                  <strong>Information gathering</strong> both parent permission from important adults in your child's life, like teachers and other care providers, to ensure a well-rounded view of your child.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px',
                  marginBottom: '12px',
                  fontSize: '20px'
                }}>
                  🎯
                </span>
                <p style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}>
                  <strong>Between-session practice plans</strong> that support your child as they start using the skills they're learning in real-life situations.
                </p>
              </div>

              <div>
                <span style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '50%',
                  textAlign: 'center',
                  lineHeight: '40px',
                  marginBottom: '12px',
                  fontSize: '20px'
                }}>
                  👥
                </span>
                <p style={{
                  fontSize: '15px',
                  color: '#4a4a4a',
                  lineHeight: '1.6',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}>
                  <strong>A combination of approaches</strong> upon session types (child-focused and caregiver-focused) without the child that include learning about emotions and behaviors, skill building, barrier identification, measured progress, and homework plans for continuity between sessions.
                </p>
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
                Hear what Brightline<br />
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
                "We have had the best experience with Brightline. My daughter has been able to use the techniques given by her therapist and it really has helped her. I would recommend Brightline to anyone whose child could benefit from therapy and learning coping mechanisms for everyday life. Our family and her teachers have seen a dramatic change and Brightline looks forward to every session."
              </p>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src="/playtime.png"
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
              If's okay if you don't know the root of the issue or are unsure what to say. We're here to listen — and we'd love to hear from you.
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
