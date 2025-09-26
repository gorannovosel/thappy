package article

import "errors"

var (
	ErrMissingArticleID   = errors.New("article ID is required")
	ErrMissingTitle       = errors.New("article title is required")
	ErrMissingContent     = errors.New("article content is required")
	ErrMissingAuthor      = errors.New("article author is required")
	ErrMissingCategory    = errors.New("article category is required")
	ErrMissingSlug        = errors.New("article slug is required")
	ErrInvalidCategory    = errors.New("invalid article category")
	ErrNoFieldsToUpdate   = errors.New("at least one field must be provided for update")
)