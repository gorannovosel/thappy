package user

import (
	"context"
	"errors"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrTokenGeneration    = errors.New("failed to generate token")
	ErrTokenInvalid       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token expired")
)

type UserService interface {
	Register(ctx context.Context, email, password string) (*User, error)
	Login(ctx context.Context, email, password string) (string, error)
	GetUserByID(ctx context.Context, id string) (*User, error)
	UpdateUser(ctx context.Context, user *User) error
}

type TokenService interface {
	GenerateToken(userID string) (string, error)
	ValidateToken(token string) (string, error)
}
