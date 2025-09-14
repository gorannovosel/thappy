import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';
import '../../styles/article-content.css';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author?: string;
  featured?: boolean;
  image?: string;
}

const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'Early Signs of Speech Delay in Children',
    excerpt: 'Learn to recognize the warning signs of speech delays and when to seek professional help for your child.',
    content: `
      <p>Speech development is a crucial milestone in every child's growth journey. As parents, it's natural to feel concerned when you notice your child might be behind their peers in speaking. Understanding the early signs of speech delay can help you take proactive steps to support your child's communication development.</p>

      <h2>What is Speech Delay?</h2>
      <p>Speech delay refers to a situation where a child is not meeting the typical speech and language milestones for their age. It's important to note that children develop at different rates, and some variation is completely normal. However, significant delays may indicate the need for professional evaluation and intervention.</p>

      <h2>Key Warning Signs by Age Group</h2>

      <h3>12-18 Months</h3>
      <ul>
        <li>Not saying "mama" or "dada" by 12 months</li>
        <li>Not pointing to objects or waving bye-bye</li>
        <li>Not responding to their name consistently</li>
        <li>Not following simple one-step directions</li>
      </ul>

      <h3>18-24 Months</h3>
      <ul>
        <li>Vocabulary of fewer than 10-15 words</li>
        <li>Not combining two words together</li>
        <li>Difficulty imitating sounds or words</li>
        <li>Not understanding simple questions</li>
      </ul>

      <h3>2-3 Years</h3>
      <ul>
        <li>Vocabulary of fewer than 50 words</li>
        <li>Not using 2-3 word sentences</li>
        <li>Speech that is mostly unintelligible to strangers</li>
        <li>Not asking simple questions like "What's that?"</li>
      </ul>

      <h2>When to Seek Professional Help</h2>
      <p>If you notice several of these warning signs, it's recommended to consult with your pediatrician or a speech-language pathologist. Early intervention can make a significant difference in a child's speech development journey.</p>

      <h2>Supporting Speech Development at Home</h2>
      <p>While professional help may be needed, there are many ways you can support your child's speech development at home:</p>
      <ul>
        <li>Read together daily</li>
        <li>Narrate your daily activities</li>
        <li>Sing songs and nursery rhymes</li>
        <li>Give your child time to respond</li>
        <li>Model correct speech without directly correcting</li>
      </ul>

      <p>Remember, every child is unique, and with the right support, children with speech delays can make remarkable progress. Trust your instincts as a parent, and don't hesitate to seek professional guidance when you have concerns.</p>
    `,
    category: 'Speech Development',
    readTime: '5 min read',
    publishedDate: '2024-01-15',
    author: 'Dr. Sarah Johnson, SLP',
    featured: true,
    image: '/article-images/speech-delay.jpg'
  },
  {
    id: '2',
    title: 'Supporting Your Child Through Occupational Therapy',
    excerpt: 'Discover how to reinforce occupational therapy goals at home and create a supportive environment for your child.',
    content: `
      <p>Occupational therapy plays a vital role in helping children develop the skills they need for daily activities, from buttoning shirts to writing letters. As a parent, you are a crucial partner in your child's therapeutic journey, and there are many ways you can support their progress at home.</p>

      <h2>Understanding Occupational Therapy Goals</h2>
      <p>Occupational therapists work with children to develop:</p>
      <ul>
        <li>Fine motor skills for writing, cutting, and manipulating small objects</li>
        <li>Gross motor skills for balance, coordination, and strength</li>
        <li>Sensory processing abilities</li>
        <li>Visual-perceptual skills</li>
        <li>Self-care and independence skills</li>
      </ul>

      <h2>Creating a Supportive Home Environment</h2>
      <p>Your home environment can significantly impact your child's progress. Consider these modifications:</p>

      <h3>Sensory-Friendly Spaces</h3>
      <ul>
        <li>Create quiet areas for regulation and calm-down time</li>
        <li>Provide sensory tools like fidgets, weighted blankets, or noise-canceling headphones</li>
        <li>Use visual schedules and timers to provide structure</li>
      </ul>

      <h3>Adaptive Equipment</h3>
      <ul>
        <li>Use pencil grips, adaptive utensils, or special scissors as recommended</li>
        <li>Adjust furniture height for proper positioning</li>
        <li>Consider tablet stands or slant boards for writing activities</li>
      </ul>

      <h2>Incorporating Therapy into Daily Routines</h2>
      <p>The best therapy happens when it's integrated naturally into daily life:</p>
      <ul>
        <li>Practice buttoning during dressing time</li>
        <li>Involve your child in cooking to work on measuring and mixing</li>
        <li>Turn cleanup time into a sorting and organizing activity</li>
        <li>Use bath time for sensory play and body awareness</li>
      </ul>

      <h2>Communication with Your Therapist</h2>
      <p>Maintain open communication with your child's occupational therapist. Share observations about what works at home, challenges you're facing, and celebrate progress together. This partnership ensures consistency between therapy sessions and home practice.</p>

      <p>Remember, progress may be gradual, and that's perfectly normal. Celebrate small victories and remain patient and encouraging throughout your child's journey.</p>
    `,
    category: 'Occupational Therapy',
    readTime: '7 min read',
    publishedDate: '2024-01-12',
    author: 'Maria Rodriguez, OTR/L',
    image: '/article-images/occupational-therapy.jpg'
  },
  {
    id: '3',
    title: 'Building Social Skills: Activities for Shy Children',
    excerpt: 'Practical strategies and fun activities to help shy children develop confidence and social skills.',
    content: `
      <p>Shyness is a common trait in children, and while it's not necessarily a problem, helping shy children develop social skills can boost their confidence and help them form meaningful relationships. The key is to approach this gently and at your child's pace.</p>

      <h2>Understanding Shyness vs. Social Anxiety</h2>
      <p>It's important to distinguish between typical shyness and social anxiety. Shyness is a personality trait that many children outgrow, while social anxiety can be more persistent and may require professional support. Signs that warrant professional attention include:</p>
      <ul>
        <li>Extreme distress in social situations</li>
        <li>Physical symptoms like stomachaches before social events</li>
        <li>Complete avoidance of peer interactions</li>
        <li>Regression in previously developed skills</li>
      </ul>

      <h2>Building Social Skills Through Play</h2>
      <p>Play is the natural way children learn social skills. Here are some activities to try:</p>

      <h3>Parallel Play Activities</h3>
      <ul>
        <li>Side-by-side art projects</li>
        <li>Building blocks or puzzles in the same space</li>
        <li>Playing with similar toys near other children</li>
      </ul>

      <h3>Structured Social Activities</h3>
      <ul>
        <li>Board games with simple rules</li>
        <li>Cooperative art projects</li>
        <li>Music and movement activities</li>
        <li>Storytelling circles</li>
      </ul>

      <h2>Gradual Exposure Techniques</h2>
      <p>Help your shy child gradually become more comfortable in social situations:</p>
      <ol>
        <li>Start with one-on-one playdates</li>
        <li>Choose familiar environments initially</li>
        <li>Allow your child to observe before participating</li>
        <li>Prepare them for social situations by discussing what to expect</li>
        <li>Role-play common social scenarios at home</li>
      </ol>

      <h2>Building Confidence at Home</h2>
      <p>Confidence built at home translates to social situations:</p>
      <ul>
        <li>Practice conversation starters</li>
        <li>Teach empathy through books and discussions</li>
        <li>Model social interactions</li>
        <li>Celebrate social successes, no matter how small</li>
        <li>Avoid labeling your child as "shy" in front of others</li>
      </ul>

      <h2>Working with Schools and Caregivers</h2>
      <p>Collaborate with your child's teachers and caregivers to create consistent support across environments. Share strategies that work at home and ask about social opportunities at school.</p>

      <p>Remember, some children are naturally more introverted, and that's perfectly okay. The goal isn't to change your child's personality but to give them the tools they need to navigate social situations comfortably and confidently.</p>
    `,
    category: 'Social Development',
    readTime: '6 min read',
    publishedDate: '2024-01-10',
    author: 'Dr. Michael Chen, Child Psychologist',
    image: '/article-images/social-skills.jpg'
  },
  {
    id: '4',
    title: 'Understanding Sensory Processing in Children',
    excerpt: 'A comprehensive guide to sensory processing differences and how they affect daily life.',
    content: `
      <p>Sensory processing refers to how our nervous system receives, organizes, and responds to sensory information from our environment. For some children, this process works differently, which can significantly impact their daily experiences and behaviors.</p>

      <h2>The Eight Sensory Systems</h2>
      <p>Most people are familiar with the five traditional senses, but there are actually eight sensory systems:</p>

      <h3>External Senses</h3>
      <ul>
        <li><strong>Visual:</strong> What we see</li>
        <li><strong>Auditory:</strong> What we hear</li>
        <li><strong>Tactile:</strong> What we touch and feel</li>
        <li><strong>Olfactory:</strong> What we smell</li>
        <li><strong>Gustatory:</strong> What we taste</li>
      </ul>

      <h3>Internal Senses</h3>
      <ul>
        <li><strong>Vestibular:</strong> Balance and spatial orientation</li>
        <li><strong>Proprioceptive:</strong> Body position and movement</li>
        <li><strong>Interoceptive:</strong> Internal body signals (hunger, thirst, need for bathroom)</li>
      </ul>

      <h2>Types of Sensory Processing Differences</h2>

      <h3>Sensory Over-Responsivity</h3>
      <p>Children who are over-responsive may:</p>
      <ul>
        <li>Cover their ears in noisy environments</li>
        <li>Refuse to wear certain textures of clothing</li>
        <li>Become upset by unexpected touch</li>
        <li>Avoid messy activities like finger painting</li>
        <li>Be extremely bothered by bright lights</li>
      </ul>

      <h3>Sensory Under-Responsivity</h3>
      <p>Children who are under-responsive may:</p>
      <ul>
        <li>Not notice when their name is called</li>
        <li>Seem unaware of pain or temperature changes</li>
        <li>Appear lethargic or withdrawn</li>
        <li>Have difficulty with body awareness</li>
        <li>Not respond to sensory input that others find obvious</li>
      </ul>

      <h3>Sensory Seeking</h3>
      <p>Children who seek sensory input may:</p>
      <ul>
        <li>Crave movement and have difficulty sitting still</li>
        <li>Touch everything and everyone</li>
        <li>Make loud noises or seek noisy environments</li>
        <li>Prefer intense flavors or textures</li>
        <li>Enjoy rough play or tight hugs</li>
      </ul>

      <h2>Supporting Children with Sensory Differences</h2>

      <h3>Environmental Modifications</h3>
      <ul>
        <li>Create calm, organized spaces</li>
        <li>Use visual schedules and timers</li>
        <li>Provide sensory tools like fidgets or noise-canceling headphones</li>
        <li>Adjust lighting and reduce clutter</li>
      </ul>

      <h3>Sensory Strategies</h3>
      <ul>
        <li>Offer sensory breaks throughout the day</li>
        <li>Provide alerting activities for under-responsive children</li>
        <li>Offer calming activities for over-responsive children</li>
        <li>Use heavy work activities for sensory seekers</li>
      </ul>

      <h2>When to Seek Professional Help</h2>
      <p>Consider consulting an occupational therapist if sensory differences are significantly impacting your child's ability to participate in daily activities, school, or social situations.</p>

      <p>Understanding your child's unique sensory profile can help you provide the support they need to thrive in their daily activities and relationships.</p>
    `,
    category: 'Sensory Development',
    readTime: '8 min read',
    publishedDate: '2024-01-08',
    author: 'Lisa Thompson, OTR/L, SIT',
    featured: true,
    image: '/article-images/sensory-processing.jpg'
  }
];

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = sampleArticles.find(a => a.id === id);

  if (!article) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
        <h1>Article Not Found</h1>
        <p style={{ marginBottom: 'var(--spacing-lg)' }}>
          The article you're looking for doesn't exist.
        </p>
        <Link to="/articles" className={styles.btnPrimary}>
          Back to Articles
        </Link>
      </div>
    );
  }

  const relatedArticles = sampleArticles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md) 0',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)'
        }}>
          <Link
            to="/articles"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              marginRight: 'var(--spacing-xs)'
            }}
          >
            Articles
          </Link>
          <span style={{ margin: '0 var(--spacing-xs)' }}>/</span>
          <span style={{ color: 'var(--color-primary)', marginRight: 'var(--spacing-xs)' }}>
            {article.category}
          </span>
          <span style={{ margin: '0 var(--spacing-xs)' }}>/</span>
          <span>{article.title}</span>
        </nav>

        {/* Article Header */}
        <header style={{ marginBottom: 'var(--spacing-2xl)' }}>
          {/* Category Badge */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500'
            }}>
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: 'var(--spacing-lg)',
            color: '#1f2937',
            fontFamily: 'var(--font-family-display)'
          }}>
            {article.title}
          </h1>

          {/* Meta Information */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-md) 0',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            {article.author && (
              <span style={{ fontWeight: '500', color: '#1f2937' }}>
                By {article.author}
              </span>
            )}
            <span>{new Date(article.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>{article.readTime}</span>
          </div>
        </header>

        {/* Hero Image */}
        {article.image && (
          <div style={{
            marginBottom: 'var(--spacing-2xl)',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-muted)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                margin: '0 auto var(--spacing-md) auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📖
              </div>
              Article Image Placeholder
              <br />
              <small style={{ fontSize: 'var(--font-size-sm)' }}>
                {article.image}
              </small>
            </div>
          </div>
        )}

        {/* Article Content */}
        <article style={{
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.8',
          fontSize: 'var(--font-size-lg)',
          color: '#1f2937'
        }}>
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              marginBottom: 'var(--spacing-2xl)'
            }}
            className="article-content"
          />
        </article>

        {/* Article Footer */}
        <footer style={{
          borderTop: '2px solid var(--color-border)',
          paddingTop: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)'
          }}>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                margin: 0
              }}>
                Was this article helpful?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className={styles.btnSecondary} style={{ padding: '8px 16px' }}>
                👍 Helpful
              </button>
              <button className={styles.btnSecondary} style={{ padding: '8px 16px' }}>
                👎 Not Helpful
              </button>
            </div>
          </div>
        </footer>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section>
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: '#1f2937'
            }}>
              More in {article.category}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {relatedArticles.map(relatedArticle => (
                <Link
                  key={relatedArticle.id}
                  to={`/articles/${relatedArticle.id}`}
                  className={styles.card}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span style={{
                      color: 'var(--color-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {relatedArticle.category}
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    marginBottom: 'var(--spacing-sm)',
                    color: '#1f2937',
                    lineHeight: '1.4'
                  }}>
                    {relatedArticle.title}
                  </h3>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-md)',
                    lineHeight: '1.6'
                  }}>
                    {relatedArticle.excerpt}
                  </p>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)'
                  }}>
                    {relatedArticle.readTime}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Articles */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-2xl)',
          paddingTop: 'var(--spacing-2xl)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <Link
            to="/articles"
            className={styles.btnSecondary}
            style={{ padding: '12px 24px' }}
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticleDetailPage;