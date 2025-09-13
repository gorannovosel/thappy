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
	// Default to client role for backward compatibility
	return s.RegisterWithRole(ctx, email, password, user.RoleClient)
}

func (s *UserService) RegisterWithRole(ctx context.Context, email, password string, role user.UserRole) (*user.User, error) {
	// Normalize email
	email = strings.ToLower(strings.TrimSpace(email))

	// Check if user already exists
	exists, err := s.repo.ExistsByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, user.ErrUserAlreadyExists
	}

	// Create new user with role
	userEntity, err := user.NewUserWithRole(email, password, role)
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

func (s *UserService) GetUserByEmail(ctx context.Context, email string) (*user.User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	return s.repo.GetByEmail(ctx, email)
}

func (s *UserService) UpdateUser(ctx context.Context, userEntity *user.User) error {
	return s.repo.Update(ctx, userEntity)
}

func (s *UserService) GetUsersByRole(ctx context.Context, role user.UserRole) ([]*user.User, error) {
	return s.repo.GetByRole(ctx, role)
}

func (s *UserService) GetActiveUsers(ctx context.Context) ([]*user.User, error) {
	return s.repo.GetActiveUsers(ctx)
}

func (s *UserService) GetActiveUsersByRole(ctx context.Context, role user.UserRole) ([]*user.User, error) {
	return s.repo.GetActiveUsersByRole(ctx, role)
}

func (s *UserService) DeactivateUser(ctx context.Context, userID string) error {
	userEntity, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	userEntity.SetActive(false)

	return s.repo.Update(ctx, userEntity)
}

func (s *UserService) ActivateUser(ctx context.Context, userID string) error {
	userEntity, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	userEntity.SetActive(true)

	return s.repo.Update(ctx, userEntity)
}
