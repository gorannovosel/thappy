import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';
import {
  articleApi,
  ARTICLE_CATEGORIES,
  formatCategoryName,
} from '../../services/article';
import { ArticleSummaryResponse } from '../../types/api';

// Calculate estimated read time based on content length
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

const categories = [
  'All Articles',
  ...Object.values(ARTICLE_CATEGORIES).map(formatCategoryName),
];

const ArticlesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<ArticleSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await articleApi.getArticles(true); // Only published articles
        setArticles(response.articles);
      } catch (err) {
        console.error('Failed to load articles:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load articles'
        );
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const formattedCategory = formatCategoryName(article.category);
    const matchesCategory =
      selectedCategory === 'All Articles' ||
      formattedCategory === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content_preview
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      formattedCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // For featured articles, we'll use the first 3 articles as featured for demo purposes
  const featuredArticles = filteredArticles.slice(0, 3);
  const regularArticles = filteredArticles;

  if (loading) {
    return (
      <div>
        <div className={styles.container}>
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-2xl)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: 'var(--spacing-lg)',
                color: '#f59e0b',
              }}
            >
              📖
            </div>
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                color: '#1f2937',
              }}
            >
              Loading Articles...
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-base)',
              }}
            >
              Please wait while we fetch the latest articles for you.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={styles.container}>
          <div
            className={styles.card}
            style={{
              textAlign: 'center',
              margin: 'var(--spacing-2xl) auto',
              maxWidth: '600px',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                marginBottom: 'var(--spacing-lg)',
                color: '#ef4444',
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                color: '#1f2937',
              }}
            >
              Failed to Load Articles
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'var(--font-size-base)',
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={styles.btnPrimary}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
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
              marginBottom: 'var(--spacing-xl)',
              color: '#1f2937',
              fontFamily: 'var(--font-family-display)',
            }}
          >
            Articles & Resources
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: '1.6',
              color: '#4b5563',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Expert insights, practical tips, and educational content to support
            your family's journey.
          </p>
        </div>

        {/* Search and Filters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-2xl)',
          }}
        >
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
              onFocus={e => (e.currentTarget.style.borderColor = '#f59e0b')}
              onBlur={e =>
                (e.currentTarget.style.borderColor = 'var(--color-border)')
              }
            />
          </div>

          {/* Category Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--spacing-sm)',
              justifyContent: 'center',
            }}
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor:
                    selectedCategory === category ? '#f59e0b' : 'transparent',
                  color: selectedCategory === category ? 'white' : '#374151',
                  border:
                    selectedCategory === category
                      ? 'none'
                      : '2px solid var(--color-border)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseOut={e => {
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
              <h2
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-lg)',
                  color: '#1f2937',
                }}
              >
                Featured Articles
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: 'var(--spacing-xl)',
                }}
              >
                {featuredArticles.map(article => (
                  <article
                    key={article.id}
                    className={styles.card}
                    style={{
                      border: '2px solid #f59e0b',
                      position: 'relative',
                      height: 'fit-content',
                    }}
                  >
                    {/* Featured Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '20px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: 'var(--border-radius)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      Featured
                    </div>

                    {/* Article Image Placeholder */}
                    <div
                      style={{
                        height: '200px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-sm)',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '2rem',
                            marginBottom: 'var(--spacing-xs)',
                          }}
                        >
                          📖
                        </div>
                        Article Image
                      </div>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <span
                        style={{
                          color: '#f59e0b',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        {formatCategoryName(article.category)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: '700',
                        lineHeight: '1.4',
                        marginBottom: 'var(--spacing-sm)',
                        color: '#1f2937',
                      }}
                    >
                      <Link
                        to={`/articles/${article.slug}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--spacing-lg)',
                        lineHeight: 'var(--line-height-relaxed)',
                      }}
                    >
                      {article.content_preview}
                    </p>

                    {/* Meta info */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)',
                        paddingTop: 'var(--spacing-sm)',
                        borderTop: '1px solid var(--color-border)',
                      }}
                    >
                      <span>{calculateReadTime(article.content_preview)}</span>
                      <span>
                        {new Date(article.published_date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Author */}
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)',
                      }}
                    >
                      By {article.author}
                    </div>

                    {/* Read Article Button */}
                    <Link
                      to={`/articles/${article.slug}`}
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
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-lg)',
              color: '#1f2937',
            }}
          >
            {selectedCategory === 'All Articles'
              ? 'All Articles'
              : selectedCategory}
            {searchTerm && ` matching "${searchTerm}"`}
            <span
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: '400',
                color: 'var(--color-text-muted)',
                marginLeft: 'var(--spacing-sm)',
              }}
            >
              ({filteredArticles.length}{' '}
              {filteredArticles.length === 1 ? 'article' : 'articles'})
            </span>
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
                  setSelectedCategory('All Articles');
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--spacing-xl)',
              }}
            >
              {(selectedCategory === 'All Articles' && !searchTerm
                ? regularArticles
                : filteredArticles
              ).map(article => (
                <article
                  key={article.id}
                  className={styles.card}
                  style={{
                    height: 'fit-content',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  {/* Article Image Placeholder */}
                  <div
                    style={{
                      height: '160px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      marginBottom: 'var(--spacing-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          marginBottom: 'var(--spacing-xs)',
                        }}
                      >
                        📄
                      </div>
                      Article Image
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span
                      style={{
                        color: '#f59e0b',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {formatCategoryName(article.category)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '600',
                      lineHeight: '1.4',
                      marginBottom: 'var(--spacing-sm)',
                      color: '#1f2937',
                    }}
                  >
                    <Link
                      to={`/articles/${article.slug}`}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                      }}
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--spacing-lg)',
                      lineHeight: 'var(--line-height-relaxed)',
                      fontSize: 'var(--font-size-sm)',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.content_preview}
                  </p>

                  {/* Meta info */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-md)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <span>{calculateReadTime(article.content_preview)}</span>
                    <span>
                      {new Date(article.published_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Author */}
                  <div
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-md)',
                    }}
                  >
                    By {article.author}
                  </div>

                  {/* Read More Button */}
                  <Link
                    to={`/articles/${article.slug}`}
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
            Stay Updated
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
            Get the latest articles and resources delivered to your inbox.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              maxWidth: '400px',
              margin: '0 auto',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
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
                outline: 'none',
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
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e =>
                (e.currentTarget.style.backgroundColor = '#d97706')
              }
              onMouseOut={e =>
                (e.currentTarget.style.backgroundColor = '#f59e0b')
              }
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
