import { ArticleListResponse, ArticleDetailResponse } from '../types/api';
import { API_BASE_URL, buildApiUrl } from '../utils/constants';

export const articleApi = {
  async getArticles(
    publishedOnly = true,
    category?: string
  ): Promise<ArticleListResponse> {
    const params = new URLSearchParams();
    if (publishedOnly) {
      params.set('published', 'true');
    }
    if (category) {
      params.set('category', category);
    }

    const url = buildApiUrl('/api/articles', params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch articles' }));
      throw new Error(error.message || 'Failed to fetch articles');
    }

    return response.json();
  },

  async getArticle(idOrSlug: string): Promise<ArticleDetailResponse> {
    const url = buildApiUrl(`/api/articles/${idOrSlug}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Failed to fetch article' }));
      throw new Error(error.message || 'Failed to fetch article');
    }

    return response.json();
  },

  async getArticlesByCategory(
    category: string,
    publishedOnly = true
  ): Promise<ArticleListResponse> {
    return this.getArticles(publishedOnly, category);
  },
};

// Category constants for consistency
export const ARTICLE_CATEGORIES = {
  ANXIETY: 'anxiety',
  DEPRESSION: 'depression',
  RELATIONSHIPS: 'relationships',
  STRESS_MANAGEMENT: 'stress-management',
  SELF_CARE: 'self-care',
  MENTAL_HEALTH: 'mental-health',
  THERAPY: 'therapy',
  MINDFULNESS: 'mindfulness',
  COPING_STRATEGIES: 'coping-strategies',
  WELLNESS: 'wellness',
} as const;

export type ArticleCategory =
  (typeof ARTICLE_CATEGORIES)[keyof typeof ARTICLE_CATEGORIES];

// Helper function to format category for display
export const formatCategoryName = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
