package postgres

import (
	"context"
	"errors"
	"strings"

	articleDomain "github.com/goran/thappy/internal/domain/article"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ArticleRepository struct {
	db *pgxpool.Pool
}

func NewArticleRepository(db *pgxpool.Pool) *ArticleRepository {
	return &ArticleRepository{
		db: db,
	}
}

func (r *ArticleRepository) Create(ctx context.Context, article *articleDomain.Article) error {
	query := `
		INSERT INTO articles (id, title, content, author, published_date, category, slug, is_published, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.Exec(ctx, query,
		article.ID,
		article.Title,
		article.Content,
		article.Author,
		article.PublishedDate,
		article.Category,
		article.Slug,
		article.IsPublished,
		article.CreatedAt,
		article.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				if strings.Contains(pgErr.Detail, "id") {
					return articleDomain.ErrArticleAlreadyExists
				}
				if strings.Contains(pgErr.Detail, "slug") {
					return articleDomain.ErrSlugAlreadyExists
				}
			}
		}
		return err
	}

	return nil
}

func (r *ArticleRepository) GetByID(ctx context.Context, id string) (*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		WHERE id = $1
	`

	var a articleDomain.Article
	err := r.db.QueryRow(ctx, query, id).Scan(
		&a.ID,
		&a.Title,
		&a.Content,
		&a.Author,
		&a.PublishedDate,
		&a.Category,
		&a.Slug,
		&a.IsPublished,
		&a.CreatedAt,
		&a.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, articleDomain.ErrArticleNotFound
		}
		return nil, err
	}

	return &a, nil
}

func (r *ArticleRepository) GetBySlug(ctx context.Context, slug string) (*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		WHERE slug = $1
	`

	var a articleDomain.Article
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&a.ID,
		&a.Title,
		&a.Content,
		&a.Author,
		&a.PublishedDate,
		&a.Category,
		&a.Slug,
		&a.IsPublished,
		&a.CreatedAt,
		&a.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, articleDomain.ErrArticleNotFound
		}
		return nil, err
	}

	return &a, nil
}

func (r *ArticleRepository) GetAll(ctx context.Context) ([]*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		ORDER BY published_date DESC
	`

	return r.scanArticles(ctx, query)
}

func (r *ArticleRepository) GetAllPublished(ctx context.Context) ([]*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		WHERE is_published = true
		ORDER BY published_date DESC
	`

	return r.scanArticles(ctx, query)
}

func (r *ArticleRepository) GetByCategory(ctx context.Context, category string) ([]*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		WHERE category = $1
		ORDER BY published_date DESC
	`

	return r.scanArticles(ctx, query, category)
}

func (r *ArticleRepository) GetPublishedByCategory(ctx context.Context, category string) ([]*articleDomain.Article, error) {
	query := `
		SELECT id, title, content, author, published_date, category, slug, is_published, created_at, updated_at
		FROM articles
		WHERE category = $1 AND is_published = true
		ORDER BY published_date DESC
	`

	return r.scanArticles(ctx, query, category)
}

func (r *ArticleRepository) Update(ctx context.Context, article *articleDomain.Article) error {
	query := `
		UPDATE articles
		SET title = $2, content = $3, author = $4, published_date = $5, category = $6, slug = $7, is_published = $8, updated_at = $9
		WHERE id = $1
	`

	result, err := r.db.Exec(ctx, query,
		article.ID,
		article.Title,
		article.Content,
		article.Author,
		article.PublishedDate,
		article.Category,
		article.Slug,
		article.IsPublished,
		article.UpdatedAt,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" && strings.Contains(pgErr.Detail, "slug") {
				return articleDomain.ErrSlugAlreadyExists
			}
		}
		return err
	}

	if result.RowsAffected() == 0 {
		return articleDomain.ErrArticleNotFound
	}

	return nil
}

func (r *ArticleRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM articles WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return articleDomain.ErrArticleNotFound
	}

	return nil
}

func (r *ArticleRepository) scanArticles(ctx context.Context, query string, args ...interface{}) ([]*articleDomain.Article, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []*articleDomain.Article
	for rows.Next() {
		var a articleDomain.Article
		err := rows.Scan(
			&a.ID,
			&a.Title,
			&a.Content,
			&a.Author,
			&a.PublishedDate,
			&a.Category,
			&a.Slug,
			&a.IsPublished,
			&a.CreatedAt,
			&a.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		articles = append(articles, &a)
	}

	return articles, rows.Err()
}
