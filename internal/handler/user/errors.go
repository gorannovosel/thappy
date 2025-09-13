package user

import "errors"

var (
	ErrMissingEmail    = errors.New("email is required")
	ErrMissingPassword = errors.New("password is required")
	ErrMissingUserID   = errors.New("user ID not found in context")
	ErrInvalidUserID   = errors.New("invalid user ID format")
)
