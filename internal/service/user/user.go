package user

import (
	"context"
	"errors"
	"strings"

	"github.com/goran/thappy/internal/domain/user"
)

type UserService struct {
	repo         user.UserRepository
	tokenService user.TokenService
}

func NewUserService(repo user.UserRepository, tokenService user.TokenService) *UserService {
	return &UserService{
		repo:         repo,
		tokenService: tokenService,
	}
}

func (s *UserService) Register(ctx context.Context, email, password string) (*user.User, error) {
	// Normalize email
	email = strings.ToLower(strings.TrimSpace(email))

	// Check if user already exists
	existingUser, err := s.repo.GetByEmail(ctx, email)
	if err != nil && !errors.Is(err, user.ErrUserNotFound) {
		return nil, err
	}
	if existingUser != nil {
		return nil, user.ErrUserAlreadyExists
	}

	// Create new user
	userEntity, err := user.NewUser(email, password)
	if err != nil {
		return nil, err
	}

	// Save to repository
	if err := s.repo.Create(ctx, userEntity); err != nil {
		return nil, err
	}

	return userEntity, nil
}

func (s *UserService) Login(ctx context.Context, email, password string) (string, error) {
	// Normalize email
	email = strings.ToLower(strings.TrimSpace(email))

	// Get user by email
	userEntity, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			return "", user.ErrInvalidCredentials
		}
		return "", err
	}

	// Validate password
	if !userEntity.ValidatePassword(password) {
		return "", user.ErrInvalidCredentials
	}

	// Generate token
	token, err := s.tokenService.GenerateToken(userEntity.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *UserService) GetUserByID(ctx context.Context, id string) (*user.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *UserService) UpdateUser(ctx context.Context, userEntity *user.User) error {
	return s.repo.Update(ctx, userEntity)
}
