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
	RegisterWithRole(ctx context.Context, email, password string, role UserRole) (*User, error)
	Login(ctx context.Context, email, password string) (string, error)
	GetUserByID(ctx context.Context, id string) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	UpdateUser(ctx context.Context, user *User) error
	GetUsersByRole(ctx context.Context, role UserRole) ([]*User, error)
	GetActiveUsers(ctx context.Context) ([]*User, error)
	GetActiveUsersByRole(ctx context.Context, role UserRole) ([]*User, error)
	DeactivateUser(ctx context.Context, userID string) error
	ActivateUser(ctx context.Context, userID string) error
}

type TokenService interface {
	GenerateToken(userID string) (string, error)
	ValidateToken(token string) (string, error)
}
