package handler

import (
	"time"

	"github.com/goran/thappy/internal/domain/user"
)

// Request DTOs
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	Email string `json:"email,omitempty"`
}

// Response DTOs
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type RegisterResponse struct {
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

type LoginResponse struct {
	Token   string       `json:"token"`
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

type ProfileResponse struct {
	User UserResponse `json:"user"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

// Helper functions to convert domain models to DTOs
func ToUserResponse(user *user.User) UserResponse {
	return UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

// Validation functions
func (r *RegisterRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	if r.Password == "" {
		return ErrMissingPassword
	}
	return nil
}

func (r *LoginRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	if r.Password == "" {
		return ErrMissingPassword
	}
	return nil
}

func (r *UpdateProfileRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	return nil
}
