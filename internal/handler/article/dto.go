package article

import (
	"time"

	"github.com/goran/thappy/internal/domain/article"
)

// Request DTOs
type CreateArticleRequest struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Author   string `json:"author"`
	Category string `json:"category"`
	Slug     string `json:"slug"`
}

type UpdateArticleRequest struct {
	Title       string `json:"title,omitempty"`
	Content     string `json:"content,omitempty"`
	Author      string `json:"author,omitempty"`
	Category    string `json:"category,omitempty"`
	Slug        string `json:"slug,omitempty"`
	IsPublished *bool  `json:"is_published,omitempty"`
}

// Response DTOs
type ArticleResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Content       string    `json:"content"`
	Author        string    `json:"author"`
	PublishedDate time.Time `json:"published_date"`
	Category      string    `json:"category"`
	Slug          string    `json:"slug"`
	IsPublished   bool      `json:"is_published"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ArticleSummaryResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Author        string    `json:"author"`
	PublishedDate time.Time `json:"published_date"`
	Category      string    `json:"category"`
	Slug          string    `json:"slug"`
	IsPublished   bool      `json:"is_published"`
	ContentPreview string   `json:"content_preview"`
}

type CreateArticleResponse struct {
	Article ArticleResponse `json:"article"`
	Message string          `json:"message"`
}

type ArticleListResponse struct {
	Articles []ArticleSummaryResponse `json:"articles"`
}

type ArticleDetailResponse struct {
	Article ArticleResponse `json:"article"`
}

// Helper functions to convert domain models to DTOs
func ToArticleResponse(a *article.Article) ArticleResponse {
	return ArticleResponse{
		ID:            a.ID,
		Title:         a.Title,
		Content:       a.Content,
		Author:        a.Author,
		PublishedDate: a.PublishedDate,
		Category:      a.Category,
		Slug:          a.Slug,
		IsPublished:   a.IsPublished,
		CreatedAt:     a.CreatedAt,
		UpdatedAt:     a.UpdatedAt,
	}
}

func ToArticleSummaryResponse(a *article.Article) ArticleSummaryResponse {
	// Create a preview of content (first 200 characters)
	contentPreview := a.Content
	if len(contentPreview) > 200 {
		contentPreview = contentPreview[:200] + "..."
	}

	return ArticleSummaryResponse{
		ID:             a.ID,
		Title:          a.Title,
		Author:         a.Author,
		PublishedDate:  a.PublishedDate,
		Category:       a.Category,
		Slug:           a.Slug,
		IsPublished:    a.IsPublished,
		ContentPreview: contentPreview,
	}
}

func ToArticleListResponse(articles []*article.Article) ArticleListResponse {
	responses := make([]ArticleSummaryResponse, len(articles))
	for i, a := range articles {
		responses[i] = ToArticleSummaryResponse(a)
	}
	return ArticleListResponse{
		Articles: responses,
	}
}

// Validation functions
func (r *CreateArticleRequest) Validate() error {
	if r.ID == "" {
		return ErrMissingArticleID
	}
	if r.Title == "" {
		return ErrMissingTitle
	}
	if r.Content == "" {
		return ErrMissingContent
	}
	if r.Author == "" {
		return ErrMissingAuthor
	}
	if r.Category == "" {
		return ErrMissingCategory
	}
	if r.Slug == "" {
		return ErrMissingSlug
	}
	return nil
}

func (r *UpdateArticleRequest) Validate() error {
	// For update requests, at least one field should be provided
	if r.Title == "" && r.Content == "" && r.Author == "" && r.Category == "" && r.Slug == "" && r.IsPublished == nil {
		return ErrNoFieldsToUpdate
	}
	return nil
}