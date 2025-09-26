package article

import (
	"context"
	"errors"
)

var (
	ErrArticleNotFound      = errors.New("article not found")
	ErrArticleAlreadyExists = errors.New("article already exists")
	ErrSlugAlreadyExists    = errors.New("article slug already exists")
)

type Repository interface {
	Create(ctx context.Context, article *Article) error
	GetByID(ctx context.Context, id string) (*Article, error)
	GetBySlug(ctx context.Context, slug string) (*Article, error)
	GetAll(ctx context.Context) ([]*Article, error)
	GetAllPublished(ctx context.Context) ([]*Article, error)
	GetByCategory(ctx context.Context, category string) ([]*Article, error)
	GetPublishedByCategory(ctx context.Context, category string) ([]*Article, error)
	Update(ctx context.Context, article *Article) error
	Delete(ctx context.Context, id string) error
}
