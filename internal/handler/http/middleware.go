package http

import (
	"context"
	"net/http"
	"strings"

	"github.com/goran/thappy/internal/domain/user"
)

type AuthMiddleware struct {
	tokenService user.TokenService
	userService  user.UserService
}

func NewAuthMiddleware(tokenService user.TokenService, userService user.UserService) *AuthMiddleware {
	return &AuthMiddleware{
		tokenService: tokenService,
		userService:  userService,
	}
}

func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := m.extractTokenFromHeader(r)
		if token == "" {
			writeErrorResponse(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		userID, err := m.tokenService.ValidateToken(token)
		if err != nil {
			m.handleTokenError(w, err)
			return
		}

		// Verify user still exists
		_, err = m.userService.GetUserByID(r.Context(), userID)
		if err != nil {
			if err == user.ErrUserNotFound {
				writeErrorResponse(w, http.StatusUnauthorized, "User not found")
				return
			}
			writeErrorResponse(w, http.StatusInternalServerError, "Internal server error")
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *AuthMiddleware) OptionalAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := m.extractTokenFromHeader(r)
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}

		userID, err := m.tokenService.ValidateToken(token)
		if err != nil {
			// For optional auth, we don't return error, just continue without user context
			next.ServeHTTP(w, r)
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *AuthMiddleware) extractTokenFromHeader(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	// Expected format: "Bearer <token>"
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return parts[1]
}

func (m *AuthMiddleware) handleTokenError(w http.ResponseWriter, err error) {
	switch err {
	case user.ErrTokenInvalid:
		writeErrorResponse(w, http.StatusUnauthorized, "Invalid token")
	case user.ErrTokenExpired:
		writeErrorResponse(w, http.StatusUnauthorized, "Token expired")
	default:
		writeErrorResponse(w, http.StatusUnauthorized, "Token validation failed")
	}
}

// CORS Middleware
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Request Logging Middleware
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simple request logging - in production use a proper logger
		// log.Printf("%s %s %s", r.Method, r.URL.Path, r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}

// Content Type Middleware
func JSONMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" || r.Method == "PUT" || r.Method == "PATCH" {
			if r.Header.Get("Content-Type") != "application/json" {
				writeErrorResponse(w, http.StatusBadRequest, "Content-Type must be application/json")
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

// Helper function for middleware to write error responses
func writeErrorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	// Simple JSON encoding - in production use proper error handling
	json := `{"error":"` + message + `"}`
	w.Write([]byte(json))
}
