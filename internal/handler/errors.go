package handler

import "errors"

var (
	ErrMissingEmail    = errors.New("email is required")
	ErrMissingPassword = errors.New("password is required")
	ErrInvalidJSON     = errors.New("invalid JSON format")
	ErrMissingUserID   = errors.New("user ID not found in context")
	ErrInvalidUserID   = errors.New("invalid user ID format")
	ErrUnauthorized    = errors.New("unauthorized")
	ErrInternalServer  = errors.New("internal server error")
)
