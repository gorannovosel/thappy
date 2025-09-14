import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';

interface Article {
  id: string;
  title: string;
  excerpt: string;
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
    category: 'Sensory Development',
    readTime: '8 min read',
    publishedDate: '2024-01-08',
    author: 'Lisa Thompson, OTR/L, SIT',
    featured: true,
    image: '/article-images/sensory-processing.jpg'
  },
  {
    id: '5',
    title: 'Creating a Calming Environment at Home',
    excerpt: 'Tips for designing spaces that promote relaxation and emotional regulation for children with special needs.',
    category: 'Home Environment',
    readTime: '4 min read',
    publishedDate: '2024-01-05',
    author: 'Jennifer Walsh, Interior Designer',
    image: '/article-images/calming-environment.jpg'
  },
  {
    id: '6',
    title: "Working with Your Child's School: A Parent's Guide",
    excerpt: "Navigate the educational system and advocate effectively for your child's needs in school.",
    category: 'Education',
    readTime: '10 min read',
    publishedDate: '2024-01-03',
    author: 'Robert Kim, Special Education Advocate',
    image: '/article-images/school-advocacy.jpg'
  },
  {
    id: '7',
    title: 'The Power of Play Therapy for Children',
    excerpt: 'Explore how play therapy can help children express emotions and develop coping skills in a natural, engaging way.',
    category: 'Therapy Approaches',
    readTime: '6 min read',
    publishedDate: '2023-12-28',
    author: 'Dr. Amanda Foster, LMFT',
    image: '/article-images/play-therapy.jpg'
  },
  {
    id: '8',
    title: 'Nutrition and Behavior: Making the Connection',
    excerpt: 'Discover how dietary choices can impact your child\'s behavior, attention, and overall well-being.',
    category: 'Health & Wellness',
    readTime: '5 min read',
    publishedDate: '2023-12-25',
    author: 'Dr. Patricia Lee, Pediatric Nutritionist',
    featured: true,
    image: '/article-images/nutrition-behavior.jpg'
  },
  {
    id: '9',
    title: 'Building Independence Through Life Skills',
    excerpt: 'Age-appropriate strategies for teaching daily living skills that promote independence and confidence.',
    category: 'Life Skills',
    readTime: '7 min read',
    publishedDate: '2023-12-20',
    author: 'Thomas Anderson, Behavior Analyst',
    image: '/article-images/life-skills.jpg'
  },
  {
    id: '10',
    title: 'Supporting Siblings of Children with Special Needs',
    excerpt: 'Practical tips for ensuring all children in the family feel valued, supported, and understood.',
    category: 'Family Dynamics',
    readTime: '8 min read',
    publishedDate: '2023-12-15',
    author: 'Dr. Rachel Martinez, Family Therapist',
    image: '/article-images/sibling-support.jpg'
  },
  {
    id: '11',
    title: 'Technology Tools for Learning and Communication',
    excerpt: 'Explore assistive technologies and apps that can enhance learning and communication for children with special needs.',
    category: 'Technology',
    readTime: '6 min read',
    publishedDate: '2023-12-10',
    author: 'Alex Thompson, Assistive Technology Specialist',
    image: '/article-images/assistive-technology.jpg'
  },
  {
    id: '12',
    title: 'Managing Meltdowns: Prevention and Response Strategies',
    excerpt: 'Evidence-based approaches for preventing meltdowns and responding effectively when they occur.',
    category: 'Behavior Management',
    readTime: '9 min read',
    publishedDate: '2023-12-05',
    author: 'Dr. Kevin Brown, Behavioral Pediatrician',
    image: '/article-images/managing-meltdowns.jpg'
  }
];

const categories = [
  'All Articles',
  'Speech Development',
  'Occupational Therapy',
  'Social Development',
  'Sensory Development',
  'Home Environment',
  'Education',
  'Therapy Approaches',
  'Health & Wellness',
  'Life Skills',
  'Family Dynamics',
  'Technology',
  'Behavior Management'
];

const ArticlesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = sampleArticles.filter(article => {
    const matchesCategory =
      selectedCategory === 'All Articles' ||
      article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

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
              src="/mainpage_drawing.png"
              alt="Child illustration"
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
            Articles & Resources
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            lineHeight: '1.6',
            color: '#4b5563',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Expert insights, practical tips, and educational content to support
            your family's journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-2xl)',
        }}>
          {/* Search Bar */}
          <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-family-primary)',
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#f59e0b'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Category Filters */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)',
            justifyContent: 'center',
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor: selectedCategory === category ? '#f59e0b' : 'transparent',
                  color: selectedCategory === category ? 'white' : '#374151',
                  border: selectedCategory === category ? 'none' : '2px solid var(--color-border)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 &&
          selectedCategory === 'All Articles' &&
          !searchTerm && (
            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h2 style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-lg)',
                color: '#1f2937'
              }}>
                Featured Articles
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: 'var(--spacing-xl)',
              }}>
                {featuredArticles.map(article => (
                  <article
                    key={article.id}
                    className={styles.card}
                    style={{
                      border: '2px solid #f59e0b',
                      position: 'relative',
                      height: 'fit-content'
                    }}
                  >
                    {/* Featured Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 'var(--border-radius)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}>
                      Featured
                    </div>

                    {/* Article Image Placeholder */}
                    <div style={{
                      height: '200px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      marginBottom: 'var(--spacing-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '2rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}>📖</div>
                        {article.image?.split('/').pop()?.replace('.jpg', '')}
                      </div>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <span style={{
                        color: '#f59e0b',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}>
                        {article.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '700',
                      lineHeight: '1.4',
                      marginBottom: 'var(--spacing-sm)',
                      color: '#1f2937'
                    }}>
                      <Link
                        to={`/articles/${article.id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none'
                        }}
                      >
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--spacing-lg)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}>
                      {article.excerpt}
                    </p>

                    {/* Meta info */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-md)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--color-border)'
                    }}>
                      <span>{article.readTime}</span>
                      <span>
                        {new Date(article.publishedDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Author */}
                    {article.author && (
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)'
                      }}>
                        By {article.author}
                      </div>
                    )}

                    {/* Read Article Button */}
                    <Link
                      to={`/articles/${article.id}`}
                      className={styles.btnPrimary}
                      style={{ width: '100%' }}
                    >
                      Read Article
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}

        {/* All Articles Grid */}
        <div>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-lg)',
            color: '#1f2937'
          }}>
            {selectedCategory === 'All Articles' ? 'All Articles' : selectedCategory}
            {searchTerm && ` matching "${searchTerm}"`}
            <span style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: '400',
              color: 'var(--color-text-muted)',
              marginLeft: 'var(--spacing-sm)'
            }}>
              ({filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'})
            </span>
          </h2>

          {filteredArticles.length === 0 ? (
            <div className={styles.card} style={{ textAlign: 'center' }}>
              <h3>No Articles Found</h3>
              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-lg)',
              }}>
                {searchTerm
                  ? `No articles match your search for "${searchTerm}".`
                  : `No articles found in the ${selectedCategory} category.`}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Articles');
                }}
                className={styles.btnSecondary}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'var(--spacing-xl)',
            }}>
              {(selectedCategory === 'All Articles' && !searchTerm ? regularArticles : filteredArticles)
                .map(article => (
                <article
                  key={article.id}
                  className={styles.card}
                  style={{
                    height: 'fit-content',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  {/* Article Image Placeholder */}
                  <div style={{
                    height: '160px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: 'var(--spacing-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}>📄</div>
                      {article.image?.split('/').pop()?.replace('.jpg', '')}
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span style={{
                      color: '#f59e0b',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}>
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    marginBottom: 'var(--spacing-sm)',
                    color: '#1f2937'
                  }}>
                    <Link
                      to={`/articles/${article.id}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none'
                      }}
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-lg)',
                    lineHeight: 'var(--line-height-relaxed)',
                    fontSize: 'var(--font-size-sm)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {article.excerpt}
                  </p>

                  {/* Meta info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-sm)',
                    borderTop: '1px solid var(--color-border)'
                  }}>
                    <span>{article.readTime}</span>
                    <span>
                      {new Date(article.publishedDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Author */}
                  {article.author && (
                    <div style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-md)'
                    }}>
                      By {article.author}
                    </div>
                  )}

                  {/* Read More Button */}
                  <Link
                    to={`/articles/${article.id}`}
                    className={styles.btnSecondary}
                    style={{ width: '100%' }}
                  >
                    Read More
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div style={{
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          padding: 'var(--spacing-2xl)',
          marginTop: 'var(--spacing-2xl)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-md)',
            color: '#1f2937',
            fontFamily: 'var(--font-family-display)'
          }}>
            Stay Updated
          </h2>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: '#4b5563',
            marginBottom: 'var(--spacing-lg)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-lg) auto',
            lineHeight: '1.6'
          }}>
            Get the latest articles and resources delivered to your inbox.
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            maxWidth: '400px',
            margin: '0 auto',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 16px',
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--font-family-primary)',
                outline: 'none'
              }}
            />
            <button
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ArticlesPage;