import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../../styles/global.module.css';
import Footer from '../../components/Footer';
import '../../styles/article-content.css';
import { articleApi, formatCategoryName } from '../../services/article';
import { ArticleResponse } from '../../types/api';

// Calculate estimated read time based on content length
const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the main article
        const response = await articleApi.getArticle(id);
        setArticle(response.article);

        // Fetch related articles in the same category
        try {
          const relatedResponse = await articleApi.getArticlesByCategory(response.article.category, true);
          const related = relatedResponse.articles
            .filter(a => a.slug !== response.article.slug) // Exclude current article
            .slice(0, 3); // Limit to 3 related articles

          // Convert to full articles for related articles (we'll show preview only)
          setRelatedArticles(related.map(a => ({
            ...a,
            content: a.content_preview || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as ArticleResponse)));
        } catch (relatedError) {
          console.warn('Failed to load related articles:', relatedError);
          // Don't fail the whole page if related articles can't be loaded
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className={styles.container}>
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: 'var(--spacing-lg)',
              color: '#f59e0b'
            }}>📖</div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-md)',
              color: '#1f2937'
            }}>Loading Article...</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-base)'
            }}>Please wait while we fetch the article for you.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div>
        <div className={styles.container}>
          <div className={styles.card} style={{
            textAlign: 'center',
            margin: 'var(--spacing-2xl) auto',
            maxWidth: '600px'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: 'var(--spacing-lg)',
              color: '#ef4444'
            }}>⚠️</div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              marginBottom: 'var(--spacing-md)',
              color: '#1f2937'
            }}>{error ? 'Failed to Load Article' : 'Article Not Found'}</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-base)'
            }}>
              {error || "The article you're looking for doesn't exist."}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className={styles.btnPrimary}
                >
                  Try Again
                </button>
              )}
              <Link to="/articles" className={styles.btnSecondary}>
                Back to Articles
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            {formatCategoryName(article.category)}
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
              {formatCategoryName(article.category)}
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
            <span style={{ fontWeight: '500', color: '#1f2937' }}>
              By {article.author}
            </span>
            <span>{new Date(article.published_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>{calculateReadTime(article.content)}</span>
          </div>
        </header>


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
              More in {formatCategoryName(article.category)}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {relatedArticles.map(relatedArticle => (
                <Link
                  key={relatedArticle.id}
                  to={`/articles/${relatedArticle.slug}`}
                  className={styles.card}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <span style={{
                      color: 'var(--color-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {formatCategoryName(relatedArticle.category)}
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
                    {relatedArticle.content.substring(0, 150)}...
                  </p>
                  <div style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)'
                  }}>
                    {calculateReadTime(relatedArticle.content)}
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