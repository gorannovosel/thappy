package http

import (
	"errors"
	"net/http"

	"github.com/goran/thappy/internal/domain/user"
)

var (
	ErrMissingEmail    = errors.New("email is required")
	ErrMissingPassword = errors.New("password is required")
	ErrInvalidJSON     = errors.New("invalid JSON format")
	ErrMissingUserID   = errors.New("user ID not found in context")
	ErrInvalidUserID   = errors.New("invalid user ID format")
	ErrUnauthorized    = errors.New("unauthorized")
	ErrInternalServer  = errors.New("internal server error")
)

// ErrorHandler provides utilities for handling different types of errors
type ErrorHandler struct {
	responseWriter *ResponseWriter
}

// NewErrorHandler creates a new ErrorHandler instance
func NewErrorHandler() *ErrorHandler {
	return &ErrorHandler{
		responseWriter: NewResponseWriter(),
	}
}

// HandleServiceError maps domain/service errors to appropriate HTTP responses
func (eh *ErrorHandler) HandleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, user.ErrUserAlreadyExists):
		eh.responseWriter.WriteError(w, http.StatusConflict, "User with this email already exists")
	case errors.Is(err, user.ErrUserNotFound):
		eh.responseWriter.WriteError(w, http.StatusNotFound, "User not found")
	case errors.Is(err, user.ErrInvalidCredentials):
		eh.responseWriter.WriteError(w, http.StatusUnauthorized, "Invalid email or password")
	case errors.Is(err, user.ErrTokenGeneration):
		eh.responseWriter.WriteError(w, http.StatusInternalServerError, "Failed to generate authentication token")
	case errors.Is(err, user.ErrTokenInvalid):
		eh.responseWriter.WriteError(w, http.StatusUnauthorized, "Invalid token")
	case errors.Is(err, user.ErrTokenExpired):
		eh.responseWriter.WriteError(w, http.StatusUnauthorized, "Token expired")
	default:
		// Check for validation errors
		if eh.isValidationError(err) {
			eh.responseWriter.WriteError(w, http.StatusBadRequest, err.Error())
		} else {
			// Log unexpected errors for debugging
			eh.responseWriter.WriteError(w, http.StatusInternalServerError, "Internal server error")
		}
	}
}

// HandleValidationError handles request validation errors
func (eh *ErrorHandler) HandleValidationError(w http.ResponseWriter, err error) {
	eh.responseWriter.WriteError(w, http.StatusBadRequest, err.Error())
}

// HandleAuthError handles authentication-related errors
func (eh *ErrorHandler) HandleAuthError(w http.ResponseWriter, message string) {
	eh.responseWriter.WriteError(w, http.StatusUnauthorized, message)
}

// HandleNotFoundError handles resource not found errors
func (eh *ErrorHandler) HandleNotFoundError(w http.ResponseWriter, message string) {
	eh.responseWriter.WriteError(w, http.StatusNotFound, message)
}

// HandleInternalError handles internal server errors
func (eh *ErrorHandler) HandleInternalError(w http.ResponseWriter, message string) {
	eh.responseWriter.WriteError(w, http.StatusInternalServerError, message)
}

// isValidationError checks if the error is a validation error
func (eh *ErrorHandler) isValidationError(err error) bool {
	validationErrors := []string{
		"invalid email format",
		"password must be at least 8 characters",
		"email is required",
		"password is required",
	}

	errMsg := err.Error()
	for _, validationErr := range validationErrors {
		if errMsg == validationErr {
			return true
		}
	}
	return false
}
