package article

import (
	"errors"
	"strings"
	"time"
)

type Article struct {
	ID            string
	Title         string
	Content       string
	Author        string
	PublishedDate time.Time
	Category      string
	Slug          string
	IsPublished   bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func NewArticle(id, title, content, author, category, slug string) (*Article, error) {
	if err := validateID(id); err != nil {
		return nil, err
	}

	if err := validateTitle(title); err != nil {
		return nil, err
	}

	if err := validateContent(content); err != nil {
		return nil, err
	}

	if err := validateAuthor(author); err != nil {
		return nil, err
	}

	if err := validateCategory(category); err != nil {
		return nil, err
	}

	if err := validateSlug(slug); err != nil {
		return nil, err
	}

	now := time.Now()
	return &Article{
		ID:            strings.ToLower(strings.TrimSpace(id)),
		Title:         strings.TrimSpace(title),
		Content:       strings.TrimSpace(content),
		Author:        strings.TrimSpace(author),
		PublishedDate: now,
		Category:      strings.TrimSpace(category),
		Slug:          strings.ToLower(strings.TrimSpace(slug)),
		IsPublished:   true,
		CreatedAt:     now,
		UpdatedAt:     now,
	}, nil
}

func (a *Article) UpdateTitle(newTitle string) error {
	if err := validateTitle(newTitle); err != nil {
		return err
	}

	a.Title = strings.TrimSpace(newTitle)
	a.UpdatedAt = time.Now()
	return nil
}

func (a *Article) UpdateContent(newContent string) error {
	if err := validateContent(newContent); err != nil {
		return err
	}

	a.Content = strings.TrimSpace(newContent)
	a.UpdatedAt = time.Now()
	return nil
}

func (a *Article) UpdateAuthor(newAuthor string) error {
	if err := validateAuthor(newAuthor); err != nil {
		return err
	}

	a.Author = strings.TrimSpace(newAuthor)
	a.UpdatedAt = time.Now()
	return nil
}

func (a *Article) UpdateCategory(newCategory string) error {
	if err := validateCategory(newCategory); err != nil {
		return err
	}

	a.Category = strings.TrimSpace(newCategory)
	a.UpdatedAt = time.Now()
	return nil
}

func (a *Article) UpdateSlug(newSlug string) error {
	if err := validateSlug(newSlug); err != nil {
		return err
	}

	a.Slug = strings.ToLower(strings.TrimSpace(newSlug))
	a.UpdatedAt = time.Now()
	return nil
}

func (a *Article) SetPublished(published bool) {
	a.IsPublished = published
	a.UpdatedAt = time.Now()
}

func (a *Article) SetPublishedDate(date time.Time) {
	a.PublishedDate = date
	a.UpdatedAt = time.Now()
}

func validateID(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("article ID is required")
	}

	if len(id) < 3 {
		return errors.New("article ID must be at least 3 characters")
	}

	// Check for valid URL slug format (letters, numbers, hyphens)
	for _, char := range id {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
			return errors.New("article ID must contain only lowercase letters, numbers, and hyphens")
		}
	}

	return nil
}

func validateTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return errors.New("article title is required")
	}

	if len(title) < 5 {
		return errors.New("article title must be at least 5 characters")
	}

	if len(title) > 200 {
		return errors.New("article title must not exceed 200 characters")
	}

	return nil
}

func validateContent(content string) error {
	content = strings.TrimSpace(content)
	if content == "" {
		return errors.New("article content is required")
	}

	if len(content) < 100 {
		return errors.New("article content must be at least 100 characters")
	}

	return nil
}

func validateAuthor(author string) error {
	author = strings.TrimSpace(author)
	if author == "" {
		return errors.New("article author is required")
	}

	if len(author) < 2 {
		return errors.New("article author must be at least 2 characters")
	}

	if len(author) > 100 {
		return errors.New("article author must not exceed 100 characters")
	}

	return nil
}

func validateCategory(category string) error {
	category = strings.TrimSpace(category)
	if category == "" {
		return errors.New("article category is required")
	}

	validCategories := map[string]bool{
		"anxiety":           true,
		"depression":        true,
		"relationships":     true,
		"stress-management": true,
		"self-care":         true,
		"mental-health":     true,
		"therapy":           true,
		"mindfulness":       true,
		"coping-strategies": true,
		"wellness":          true,
	}

	if !validCategories[strings.ToLower(category)] {
		return errors.New("article category must be one of: anxiety, depression, relationships, stress-management, self-care, mental-health, therapy, mindfulness, coping-strategies, wellness")
	}

	return nil
}

func validateSlug(slug string) error {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return errors.New("article slug is required")
	}

	if len(slug) < 3 {
		return errors.New("article slug must be at least 3 characters")
	}

	if len(slug) > 100 {
		return errors.New("article slug must not exceed 100 characters")
	}

	// Check for valid URL slug format (letters, numbers, hyphens)
	for _, char := range slug {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
			return errors.New("article slug must contain only lowercase letters, numbers, and hyphens")
		}
	}

	return nil
}