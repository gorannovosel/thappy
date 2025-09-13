package service

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/goran/thappy/internal/domain/user"
)

type JWTTokenService struct {
	secretKey []byte
	ttl       time.Duration
}

type Claims struct {
	UserID    string    `json:"user_id"`
	IssuedAt  time.Time `json:"iat"`
	ExpiresAt time.Time `json:"exp"`
}

func NewJWTTokenService(secretKey string, ttl time.Duration) *JWTTokenService {
	return &JWTTokenService{
		secretKey: []byte(secretKey),
		ttl:       ttl,
	}
}

func (s *JWTTokenService) GenerateToken(userID string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:    userID,
		IssuedAt:  now,
		ExpiresAt: now.Add(s.ttl),
	}

	// Create header
	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", fmt.Errorf("failed to marshal header: %w", err)
	}

	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", fmt.Errorf("failed to marshal claims: %w", err)
	}

	// Base64 encode header and claims
	encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)

	// Create signature
	message := encodedHeader + "." + encodedClaims
	h := hmac.New(sha256.New, s.secretKey)
	h.Write([]byte(message))
	signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	// Combine to create token
	token := message + "." + signature

	return token, nil
}

func (s *JWTTokenService) ValidateToken(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", user.ErrTokenInvalid
	}

	// Verify signature
	message := parts[0] + "." + parts[1]
	h := hmac.New(sha256.New, s.secretKey)
	h.Write([]byte(message))
	expectedSignature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	if parts[2] != expectedSignature {
		return "", user.ErrTokenInvalid
	}

	// Decode claims
	claimsJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", user.ErrTokenInvalid
	}

	var claims Claims
	if err := json.Unmarshal(claimsJSON, &claims); err != nil {
		return "", user.ErrTokenInvalid
	}

	// Check expiration
	if time.Now().After(claims.ExpiresAt) {
		return "", user.ErrTokenExpired
	}

	return claims.UserID, nil
}

// SimpleTokenService is a simple token implementation for testing
type SimpleTokenService struct {
	tokens map[string]string
	ttl    time.Duration
}

func NewSimpleTokenService(ttl time.Duration) *SimpleTokenService {
	return &SimpleTokenService{
		tokens: make(map[string]string),
		ttl:    ttl,
	}
}

func (s *SimpleTokenService) GenerateToken(userID string) (string, error) {
	if userID == "" {
		return "", errors.New("user ID cannot be empty")
	}

	// Generate a simple token
	token := fmt.Sprintf("token_%s_%d", userID, time.Now().UnixNano())
	s.tokens[token] = userID

	// Clean up old tokens periodically in production
	// For now, we'll just store them

	return token, nil
}

func (s *SimpleTokenService) ValidateToken(token string) (string, error) {
	userID, exists := s.tokens[token]
	if !exists {
		return "", user.ErrTokenInvalid
	}

	return userID, nil
}
