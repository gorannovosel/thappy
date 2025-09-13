package service

import (
	"testing"
	"time"

	"github.com/goran/thappy/internal/domain/user"
)

func TestJWTTokenService_GenerateAndValidate(t *testing.T) {
	secretKey := "test-secret-key-123"
	ttl := 1 * time.Hour
	service := NewJWTTokenService(secretKey, ttl)

	tests := []struct {
		name    string
		userID  string
		wantErr bool
	}{
		{
			name:    "valid token generation and validation",
			userID:  "user-123",
			wantErr: false,
		},
		{
			name:    "token with different user ID",
			userID:  "user-456",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Generate token
			token, err := service.GenerateToken(tt.userID)
			if err != nil {
				t.Fatalf("GenerateToken() error = %v", err)
			}

			if token == "" {
				t.Error("GenerateToken() returned empty token")
			}

			// Validate token
			validatedUserID, err := service.ValidateToken(token)
			if err != nil {
				t.Fatalf("ValidateToken() error = %v", err)
			}

			if validatedUserID != tt.userID {
				t.Errorf("ValidateToken() userID = %v, want %v", validatedUserID, tt.userID)
			}
		})
	}
}

func TestJWTTokenService_ValidateInvalidToken(t *testing.T) {
	secretKey := "test-secret-key-123"
	ttl := 1 * time.Hour
	service := NewJWTTokenService(secretKey, ttl)

	tests := []struct {
		name        string
		token       string
		wantErr     error
		description string
	}{
		{
			name:        "invalid token format",
			token:       "invalid-token",
			wantErr:     user.ErrTokenInvalid,
			description: "token without proper JWT structure",
		},
		{
			name:        "token with wrong signature",
			token:       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIn0.wrong",
			wantErr:     user.ErrTokenInvalid,
			description: "token with tampered signature",
		},
		{
			name:        "empty token",
			token:       "",
			wantErr:     user.ErrTokenInvalid,
			description: "empty token string",
		},
		{
			name:        "token with only dots",
			token:       "..",
			wantErr:     user.ErrTokenInvalid,
			description: "malformed token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.ValidateToken(tt.token)
			if err == nil {
				t.Errorf("ValidateToken() expected error for %s", tt.description)
				return
			}

			if err != tt.wantErr {
				t.Errorf("ValidateToken() error = %v, want %v", err, tt.wantErr)
			}
		})
	}
}

func TestJWTTokenService_ExpiredToken(t *testing.T) {
	secretKey := "test-secret-key-123"
	ttl := 1 * time.Millisecond // Very short TTL
	service := NewJWTTokenService(secretKey, ttl)

	// Generate token
	token, err := service.GenerateToken("user-123")
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	// Wait for token to expire
	time.Sleep(10 * time.Millisecond)

	// Try to validate expired token
	_, err = service.ValidateToken(token)
	if err != user.ErrTokenExpired {
		t.Errorf("ValidateToken() error = %v, want %v", err, user.ErrTokenExpired)
	}
}

func TestJWTTokenService_DifferentSecretKeys(t *testing.T) {
	service1 := NewJWTTokenService("secret-key-1", 1*time.Hour)
	service2 := NewJWTTokenService("secret-key-2", 1*time.Hour)

	// Generate token with service1
	token, err := service1.GenerateToken("user-123")
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	// Try to validate with service2 (different secret)
	_, err = service2.ValidateToken(token)
	if err != user.ErrTokenInvalid {
		t.Errorf("ValidateToken() with different secret should fail, error = %v", err)
	}

	// Validate with correct service
	userID, err := service1.ValidateToken(token)
	if err != nil {
		t.Errorf("ValidateToken() with correct secret failed: %v", err)
	}
	if userID != "user-123" {
		t.Errorf("ValidateToken() userID = %v, want user-123", userID)
	}
}

func TestSimpleTokenService(t *testing.T) {
	service := NewSimpleTokenService(1 * time.Hour)

	tests := []struct {
		name    string
		userID  string
		wantErr bool
	}{
		{
			name:    "valid token generation",
			userID:  "user-123",
			wantErr: false,
		},
		{
			name:    "empty user ID",
			userID:  "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := service.GenerateToken(tt.userID)

			if tt.wantErr {
				if err == nil {
					t.Error("GenerateToken() expected error but got none")
				}
				return
			}

			if err != nil {
				t.Fatalf("GenerateToken() error = %v", err)
			}

			// Validate token
			validatedUserID, err := service.ValidateToken(token)
			if err != nil {
				t.Fatalf("ValidateToken() error = %v", err)
			}

			if validatedUserID != tt.userID {
				t.Errorf("ValidateToken() userID = %v, want %v", validatedUserID, tt.userID)
			}
		})
	}

	// Test invalid token
	_, err := service.ValidateToken("invalid-token")
	if err != user.ErrTokenInvalid {
		t.Errorf("ValidateToken() with invalid token, error = %v, want %v", err, user.ErrTokenInvalid)
	}
}
