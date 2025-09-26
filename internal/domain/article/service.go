package article

import "context"

type Service interface {
	CreateArticle(ctx context.Context, id, title, content, author, category, slug string) (*Article, error)
	GetArticle(ctx context.Context, id string) (*Article, error)
	GetArticleBySlug(ctx context.Context, slug string) (*Article, error)
	ListArticles(ctx context.Context) ([]*Article, error)
	ListPublishedArticles(ctx context.Context) ([]*Article, error)
	ListArticlesByCategory(ctx context.Context, category string) ([]*Article, error)
	ListPublishedArticlesByCategory(ctx context.Context, category string) ([]*Article, error)
	UpdateArticle(ctx context.Context, article *Article) error
	DeleteArticle(ctx context.Context, id string) error
}