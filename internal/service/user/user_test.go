package user

import (
	"context"
	"errors"
	"testing"

	userDomain "github.com/goran/thappy/internal/domain/user"
)

// MockUserRepository is a mock implementation of userDomain.UserRepository
type MockUserRepository struct {
	users          map[string]*userDomain.User
	emailIndex     map[string]string
	shouldFailNext bool
	failError      error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users:      make(map[string]*userDomain.User),
		emailIndex: make(map[string]string),
	}
}

func (m *MockUserRepository) Create(ctx context.Context, userEntity *userDomain.User) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	// Check if email already exists
	if _, exists := m.emailIndex[userEntity.Email]; exists {
		return userDomain.ErrUserAlreadyExists
	}

	m.users[userEntity.ID] = userEntity
	m.emailIndex[userEntity.Email] = userEntity.ID
	return nil
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	if id, exists := m.emailIndex[email]; exists {
		return m.users[id], nil
	}
	return nil, userDomain.ErrUserNotFound
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	if user, exists := m.users[id]; exists {
		return user, nil
	}
	return nil, userDomain.ErrUserNotFound
}

func (m *MockUserRepository) Update(ctx context.Context, user *userDomain.User) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.users[user.ID]; !exists {
		return userDomain.ErrUserNotFound
	}

	// Update email index if email changed
	oldUser := m.users[user.ID]
	if oldUser.Email != user.Email {
		delete(m.emailIndex, oldUser.Email)
		m.emailIndex[user.Email] = user.ID
	}

	m.users[user.ID] = user
	return nil
}

func (m *MockUserRepository) Delete(ctx context.Context, id string) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if user, exists := m.users[id]; exists {
		delete(m.emailIndex, user.Email)
		delete(m.users, id)
		return nil
	}
	return userDomain.ErrUserNotFound
}

func (m *MockUserRepository) GetByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	var users []*userDomain.User
	for _, user := range m.users {
		if user.Role == role {
			users = append(users, user)
		}
	}
	return users, nil
}

func (m *MockUserRepository) GetActiveUsers(ctx context.Context) ([]*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	var users []*userDomain.User
	for _, user := range m.users {
		if user.IsActive {
			users = append(users, user)
		}
	}
	return users, nil
}

func (m *MockUserRepository) GetActiveUsersByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	var users []*userDomain.User
	for _, user := range m.users {
		if user.Role == role && user.IsActive {
			users = append(users, user)
		}
	}
	return users, nil
}

func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return false, m.failError
	}

	_, exists := m.emailIndex[email]
	return exists, nil
}

func (m *MockUserRepository) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

// MockTokenService is a mock implementation of user.TokenService
type MockTokenService struct {
	tokens         map[string]string // token -> userID
	shouldFailNext bool
	failError      error
}

func NewMockTokenService() *MockTokenService {
	return &MockTokenService{
		tokens: make(map[string]string),
	}
}

func (m *MockTokenService) GenerateToken(userID string) (string, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return "", m.failError
	}

	token := "mock-token-" + userID
	m.tokens[token] = userID
	return token, nil
}

func (m *MockTokenService) ValidateToken(token string) (string, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return "", m.failError
	}

	if userID, exists := m.tokens[token]; exists {
		return userID, nil
	}
	return "", userDomain.ErrTokenInvalid
}

func (m *MockTokenService) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

// Tests for UserService

func TestUserService_Register(t *testing.T) {
	tests := []struct {
		name        string
		email       string
		password    string
		setupMock   func(*MockUserRepository, *MockTokenService)
		wantErr     bool
		errContains string
	}{
		{
			name:     "successful registration",
			email:    "newuser@example.com",
			password: "SecurePass123!",
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				// No setup needed for success case
			},
			wantErr: false,
		},
		{
			name:     "registration with existing email",
			email:    "existing@example.com",
			password: "SecurePass123!",
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				// Pre-create a user with the same email
				user, _ := userDomain.NewUser("existing@example.com", "OldPass123!")
				repo.users[user.ID] = user
				repo.emailIndex[user.Email] = user.ID
			},
			wantErr:     true,
			errContains: "already exists",
		},
		{
			name:        "registration with invalid email",
			email:       "invalid-email",
			password:    "SecurePass123!",
			setupMock:   func(repo *MockUserRepository, token *MockTokenService) {},
			wantErr:     true,
			errContains: "invalid email",
		},
		{
			name:        "registration with short password",
			email:       "user@example.com",
			password:    "short",
			setupMock:   func(repo *MockUserRepository, token *MockTokenService) {},
			wantErr:     true,
			errContains: "at least 8 characters",
		},
		{
			name:     "repository error during registration",
			email:    "user@example.com",
			password: "SecurePass123!",
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				repo.SetNextError(errors.New("database connection error"))
			},
			wantErr:     true,
			errContains: "database connection error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockUserRepository()
			tokenService := NewMockTokenService()
			tt.setupMock(repo, tokenService)

			userService := NewUserService(repo, tokenService)
			ctx := context.Background()

			user, err := userService.Register(ctx, tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Register() expected error but got none")
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("Register() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("Register() unexpected error = %v", err)
				return
			}

			if user == nil {
				t.Error("Register() returned nil user")
				return
			}

			if user.Email != tt.email {
				t.Errorf("Register() user.Email = %v, want %v", user.Email, tt.email)
			}

			// Verify user was saved in repository
			savedUser, err := repo.GetByEmail(ctx, tt.email)
			if err != nil {
				t.Errorf("Failed to retrieve registered user: %v", err)
			}
			if savedUser.ID != user.ID {
				t.Error("Registered user not properly saved in repository")
			}
		})
	}
}

func TestUserService_Login(t *testing.T) {
	// Create a test user
	testEmail := "testuser@example.com"
	testPassword := "TestPass123!"
	testUser, _ := userDomain.NewUser(testEmail, testPassword)

	tests := []struct {
		name        string
		email       string
		password    string
		setupMock   func(*MockUserRepository, *MockTokenService)
		wantErr     bool
		errContains string
	}{
		{
			name:     "successful login",
			email:    testEmail,
			password: testPassword,
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				repo.users[testUser.ID] = testUser
				repo.emailIndex[testUser.Email] = testUser.ID
			},
			wantErr: false,
		},
		{
			name:     "login with non-existent email",
			email:    "nonexistent@example.com",
			password: "SomePass123!",
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				// No users in repository
			},
			wantErr:     true,
			errContains: "invalid credentials",
		},
		{
			name:     "login with wrong password",
			email:    testEmail,
			password: "WrongPass123!",
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				repo.users[testUser.ID] = testUser
				repo.emailIndex[testUser.Email] = testUser.ID
			},
			wantErr:     true,
			errContains: "invalid credentials",
		},
		{
			name:     "repository error during login",
			email:    testEmail,
			password: testPassword,
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				repo.SetNextError(errors.New("database error"))
			},
			wantErr:     true,
			errContains: "database error",
		},
		{
			name:     "token generation error",
			email:    testEmail,
			password: testPassword,
			setupMock: func(repo *MockUserRepository, token *MockTokenService) {
				repo.users[testUser.ID] = testUser
				repo.emailIndex[testUser.Email] = testUser.ID
				token.SetNextError(userDomain.ErrTokenGeneration)
			},
			wantErr:     true,
			errContains: "generate token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockUserRepository()
			tokenService := NewMockTokenService()
			tt.setupMock(repo, tokenService)

			userService := NewUserService(repo, tokenService)
			ctx := context.Background()

			token, err := userService.Login(ctx, tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Login() expected error but got none")
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("Login() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("Login() unexpected error = %v", err)
				return
			}

			if token == "" {
				t.Error("Login() returned empty token")
			}

			// Verify token is valid
			userID, err := tokenService.ValidateToken(token)
			if err != nil {
				t.Errorf("Failed to validate generated token: %v", err)
			}
			if userID != testUser.ID {
				t.Error("Token does not map to correct user")
			}
		})
	}
}

func TestUserService_GetUserByID(t *testing.T) {
	testUser, _ := userDomain.NewUser("test@example.com", "TestPass123!")

	tests := []struct {
		name        string
		userID      string
		setupMock   func(*MockUserRepository)
		wantErr     bool
		errContains string
	}{
		{
			name:   "successful get user",
			userID: testUser.ID,
			setupMock: func(repo *MockUserRepository) {
				repo.users[testUser.ID] = testUser
			},
			wantErr: false,
		},
		{
			name:   "user not found",
			userID: "non-existent-id",
			setupMock: func(repo *MockUserRepository) {
				// No users in repository
			},
			wantErr:     true,
			errContains: "not found",
		},
		{
			name:   "repository error",
			userID: testUser.ID,
			setupMock: func(repo *MockUserRepository) {
				repo.SetNextError(errors.New("database error"))
			},
			wantErr:     true,
			errContains: "database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockUserRepository()
			tokenService := NewMockTokenService()
			tt.setupMock(repo)

			userService := NewUserService(repo, tokenService)
			ctx := context.Background()

			user, err := userService.GetUserByID(ctx, tt.userID)

			if tt.wantErr {
				if err == nil {
					t.Errorf("GetUserByID() expected error but got none")
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("GetUserByID() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("GetUserByID() unexpected error = %v", err)
				return
			}

			if user.ID != testUser.ID {
				t.Errorf("GetUserByID() user.ID = %v, want %v", user.ID, testUser.ID)
			}
		})
	}
}

func TestUserService_UpdateUser(t *testing.T) {
	testUser, _ := userDomain.NewUser("test@example.com", "TestPass123!")

	tests := []struct {
		name        string
		updateFunc  func(*userDomain.User)
		setupMock   func(*MockUserRepository)
		wantErr     bool
		errContains string
	}{
		{
			name: "successful update",
			updateFunc: func(u *userDomain.User) {
				u.UpdateEmail("newemail@example.com")
			},
			setupMock: func(repo *MockUserRepository) {
				repo.users[testUser.ID] = testUser
				repo.emailIndex[testUser.Email] = testUser.ID
			},
			wantErr: false,
		},
		{
			name:       "update non-existent user",
			updateFunc: func(u *userDomain.User) {},
			setupMock: func(repo *MockUserRepository) {
				// No users in repository
			},
			wantErr:     true,
			errContains: "not found",
		},
		{
			name:       "repository error during update",
			updateFunc: func(u *userDomain.User) {},
			setupMock: func(repo *MockUserRepository) {
				repo.SetNextError(errors.New("database error"))
			},
			wantErr:     true,
			errContains: "database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := NewMockUserRepository()
			tokenService := NewMockTokenService()
			tt.setupMock(repo)

			userService := NewUserService(repo, tokenService)
			ctx := context.Background()

			userCopy := *testUser
			tt.updateFunc(&userCopy)

			err := userService.UpdateUser(ctx, &userCopy)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateUser() expected error but got none")
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("UpdateUser() error = %v, want error containing %v", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateUser() unexpected error = %v", err)
			}
		})
	}
}

// Helper function
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || (len(s) > 0 && len(substr) > 0 && findSubstring(s, substr)))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
