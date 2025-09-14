import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedDate: string;
  featured?: boolean;
}

const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'Early Signs of Speech Delay in Children',
    excerpt:
      'Learn to recognize the warning signs of speech delays and when to seek professional help for your child.',
    category: 'Speech Development',
    readTime: '5 min read',
    publishedDate: '2024-01-15',
    featured: true,
  },
  {
    id: '2',
    title: 'Supporting Your Child Through Occupational Therapy',
    excerpt:
      'Discover how to reinforce occupational therapy goals at home and create a supportive environment for your child.',
    category: 'Occupational Therapy',
    readTime: '7 min read',
    publishedDate: '2024-01-12',
  },
  {
    id: '3',
    title: 'Building Social Skills: Activities for Shy Children',
    excerpt:
      'Practical strategies and fun activities to help shy children develop confidence and social skills.',
    category: 'Social Development',
    readTime: '6 min read',
    publishedDate: '2024-01-10',
  },
  {
    id: '4',
    title: 'Understanding Sensory Processing in Children',
    excerpt:
      'A comprehensive guide to sensory processing differences and how they affect daily life.',
    category: 'Sensory Development',
    readTime: '8 min read',
    publishedDate: '2024-01-08',
    featured: true,
  },
  {
    id: '5',
    title: 'Creating a Calming Environment at Home',
    excerpt:
      'Tips for designing spaces that promote relaxation and emotional regulation for children with special needs.',
    category: 'Home Environment',
    readTime: '4 min read',
    publishedDate: '2024-01-05',
  },
  {
    id: '6',
    title: "Working with Your Child's School: A Parent's Guide",
    excerpt:
      "Navigate the educational system and advocate effectively for your child's needs in school.",
    category: 'Education',
    readTime: '10 min read',
    publishedDate: '2024-01-03',
  },
];

const categories = [
  'All Topics',
  'Speech Development',
  'Occupational Therapy',
  'Social Development',
  'Sensory Development',
  'Home Environment',
  'Education',
];

const TopicsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = sampleArticles.filter(article => {
    const matchesCategory =
      selectedCategory === 'All Topics' ||
      article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
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
            Educational Topics & Resources
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
        selectedCategory === 'All Topics' &&
        !searchTerm && (
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
              Featured Articles
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--spacing-xl)',
              }}
            >
              {featuredArticles.map(article => (
                <div
                  key={article.id}
                  className={styles.card}
                  style={{
                    border: '2px solid var(--color-primary)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 'var(--border-radius)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    Featured
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span
                      style={{
                        color: 'var(--color-primary)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <h3
                    className={styles.cardTitle}
                    style={{ marginBottom: 'var(--spacing-sm)' }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--spacing-lg)',
                      lineHeight: 'var(--line-height-relaxed)',
                    }}
                  >
                    {article.excerpt}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-md)',
                    }}
                  >
                    <span>{article.readTime}</span>
                    <span>
                      {new Date(article.publishedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/topics/${article.id}`}
                    className={styles.btnPrimary}
                    style={{ width: '100%' }}
                  >
                    Read Article
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* All Articles */}
      <div>
        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
          {selectedCategory === 'All Topics'
            ? 'All Articles'
            : selectedCategory}
          {searchTerm && ` matching "${searchTerm}"`}
        </h2>

        {filteredArticles.length === 0 ? (
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <h3>No Articles Found</h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              {searchTerm
                ? `No articles match your search for "${searchTerm}".`
                : `No articles found in the ${selectedCategory} category.`}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Topics');
              }}
              className={styles.btnSecondary}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {regularArticles.map(article => (
              <div key={article.id} className={styles.card}>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <span
                    style={{
                      color: 'var(--color-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {article.category}
                  </span>
                </div>
                <h3
                  className={styles.cardTitle}
                  style={{ marginBottom: 'var(--spacing-sm)' }}
                >
                  {article.title}
                </h3>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-lg)',
                    lineHeight: 'var(--line-height-relaxed)',
                  }}
                >
                  {article.excerpt}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-md)',
                  }}
                >
                  <span>{article.readTime}</span>
                  <span>
                    {new Date(article.publishedDate).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/topics/${article.id}`}
                  className={styles.btnSecondary}
                  style={{ width: '100%' }}
                >
                  Read Article
                </Link>
              </div>
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
    </div>
  );
};

export default TopicsPage;
