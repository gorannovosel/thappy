package article

import (
	"context"
	"strings"

	"github.com/goran/thappy/internal/domain/article"
)

type ArticleService struct {
	repo article.Repository
}

func NewArticleService(repo article.Repository) *ArticleService {
	return &ArticleService{
		repo: repo,
	}
}

func (s *ArticleService) CreateArticle(ctx context.Context, id, title, content, author, category, slug string) (*article.Article, error) {
	// Normalize ID and slug to lowercase format
	id = strings.ToLower(strings.TrimSpace(id))
	slug = strings.ToLower(strings.TrimSpace(slug))

	// Check if article ID already exists
	existingArticle, err := s.repo.GetByID(ctx, id)
	if err == nil && existingArticle != nil {
		return nil, article.ErrArticleAlreadyExists
	}
	if err != nil && err != article.ErrArticleNotFound {
		return nil, err
	}

	// Check if slug already exists
	existingBySlug, err := s.repo.GetBySlug(ctx, slug)
	if err == nil && existingBySlug != nil {
		return nil, article.ErrSlugAlreadyExists
	}
	if err != nil && err != article.ErrArticleNotFound {
		return nil, err
	}

	// Create new article
	articleEntity, err := article.NewArticle(id, title, content, author, category, slug)
	if err != nil {
		return nil, err
	}

	// Save to repository
	if err := s.repo.Create(ctx, articleEntity); err != nil {
		return nil, err
	}

	return articleEntity, nil
}

func (s *ArticleService) GetArticle(ctx context.Context, id string) (*article.Article, error) {
	id = strings.ToLower(strings.TrimSpace(id))
	return s.repo.GetByID(ctx, id)
}

func (s *ArticleService) GetArticleBySlug(ctx context.Context, slug string) (*article.Article, error) {
	slug = strings.ToLower(strings.TrimSpace(slug))
	return s.repo.GetBySlug(ctx, slug)
}

func (s *ArticleService) ListArticles(ctx context.Context) ([]*article.Article, error) {
	return s.repo.GetAll(ctx)
}

func (s *ArticleService) ListPublishedArticles(ctx context.Context) ([]*article.Article, error) {
	return s.repo.GetAllPublished(ctx)
}

func (s *ArticleService) ListArticlesByCategory(ctx context.Context, category string) ([]*article.Article, error) {
	category = strings.ToLower(strings.TrimSpace(category))
	return s.repo.GetByCategory(ctx, category)
}

func (s *ArticleService) ListPublishedArticlesByCategory(ctx context.Context, category string) ([]*article.Article, error) {
	category = strings.ToLower(strings.TrimSpace(category))
	return s.repo.GetPublishedByCategory(ctx, category)
}

func (s *ArticleService) UpdateArticle(ctx context.Context, articleEntity *article.Article) error {
	return s.repo.Update(ctx, articleEntity)
}

func (s *ArticleService) DeleteArticle(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))
	return s.repo.Delete(ctx, id)
}

func (s *ArticleService) PublishArticle(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))

	articleEntity, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	articleEntity.SetPublished(true)

	return s.repo.Update(ctx, articleEntity)
}

func (s *ArticleService) UnpublishArticle(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))

	articleEntity, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	articleEntity.SetPublished(false)

	return s.repo.Update(ctx, articleEntity)
}