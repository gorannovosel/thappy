package client

import (
	"context"
	"testing"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	userDomain "github.com/goran/thappy/internal/domain/user"
)

// MockClientRepository is a mock implementation of clientDomain.ClientRepository
type MockClientRepository struct {
	profiles       map[string]*clientDomain.ClientProfile
	shouldFailNext bool
	failError      error
}

func NewMockClientRepository() *MockClientRepository {
	return &MockClientRepository{
		profiles: make(map[string]*clientDomain.ClientProfile),
	}
}

func (m *MockClientRepository) Create(ctx context.Context, profile *clientDomain.ClientProfile) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.profiles[profile.UserID]; exists {
		return clientDomain.ErrClientProfileAlreadyExists
	}

	m.profiles[profile.UserID] = profile
	return nil
}

func (m *MockClientRepository) GetByUserID(ctx context.Context, userID string) (*clientDomain.ClientProfile, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	profile, exists := m.profiles[userID]
	if !exists {
		return nil, clientDomain.ErrClientProfileNotFound
	}
	return profile, nil
}

func (m *MockClientRepository) Update(ctx context.Context, profile *clientDomain.ClientProfile) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.profiles[profile.UserID]; !exists {
		return clientDomain.ErrClientProfileNotFound
	}

	m.profiles[profile.UserID] = profile
	return nil
}

func (m *MockClientRepository) Delete(ctx context.Context, userID string) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.profiles[userID]; !exists {
		return clientDomain.ErrClientProfileNotFound
	}

	delete(m.profiles, userID)
	return nil
}

func (m *MockClientRepository) GetByTherapistID(ctx context.Context, therapistID string) ([]*clientDomain.ClientProfile, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	var profiles []*clientDomain.ClientProfile
	for _, profile := range m.profiles {
		if profile.TherapistID != nil && *profile.TherapistID == therapistID {
			profiles = append(profiles, profile)
		}
	}
	return profiles, nil
}

func (m *MockClientRepository) GetActiveClients(ctx context.Context) ([]*clientDomain.ClientProfile, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	var profiles []*clientDomain.ClientProfile
	for _, profile := range m.profiles {
		profiles = append(profiles, profile)
	}
	return profiles, nil
}

func (m *MockClientRepository) ExistsByUserID(ctx context.Context, userID string) (bool, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return false, m.failError
	}

	_, exists := m.profiles[userID]
	return exists, nil
}

func (m *MockClientRepository) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

// MockUserRepository is a simplified mock for testing
type MockUserRepository struct {
	users          map[string]*userDomain.User
	shouldFailNext bool
	failError      error
}

func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{
		users: make(map[string]*userDomain.User),
	}
}

func (m *MockUserRepository) GetByID(ctx context.Context, id string) (*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	user, exists := m.users[id]
	if !exists {
		return nil, userDomain.ErrUserNotFound
	}
	return user, nil
}

func (m *MockUserRepository) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

// Add other required methods with empty implementations for now
func (m *MockUserRepository) Create(ctx context.Context, user *userDomain.User) error { return nil }
func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*userDomain.User, error) {
	return nil, nil
}
func (m *MockUserRepository) Update(ctx context.Context, user *userDomain.User) error { return nil }
func (m *MockUserRepository) Delete(ctx context.Context, id string) error             { return nil }
func (m *MockUserRepository) GetByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	return nil, nil
}
func (m *MockUserRepository) GetActiveUsers(ctx context.Context) ([]*userDomain.User, error) {
	return nil, nil
}
func (m *MockUserRepository) GetActiveUsersByRole(ctx context.Context, role userDomain.UserRole) ([]*userDomain.User, error) {
	return nil, nil
}
func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	return false, nil
}

func TestClientService_CreateProfile(t *testing.T) {
	tests := []struct {
		name    string
		userID  string
		request clientDomain.CreateProfileRequest
		setup   func(*MockUserRepository, *MockClientRepository)
		wantErr bool
	}{
		{
			name:   "successful profile creation",
			userID: "user-123",
			request: clientDomain.CreateProfileRequest{
				FirstName: "John",
				LastName:  "Doe",
				Phone:     "+1-555-0123",
			},
			setup: func(userRepo *MockUserRepository, clientRepo *MockClientRepository) {
				user, _ := userDomain.NewUserWithRole("john@example.com", "password123", userDomain.RoleClient)
				user.ID = "user-123"
				userRepo.users[user.ID] = user
			},
			wantErr: false,
		},
		{
			name:   "user not found",
			userID: "nonexistent",
			request: clientDomain.CreateProfileRequest{
				FirstName: "John",
				LastName:  "Doe",
			},
			setup: func(userRepo *MockUserRepository, clientRepo *MockClientRepository) {
				// No setup - user doesn't exist
			},
			wantErr: true,
		},
		{
			name:   "user is not a client",
			userID: "therapist-123",
			request: clientDomain.CreateProfileRequest{
				FirstName: "Dr. Jane",
				LastName:  "Smith",
			},
			setup: func(userRepo *MockUserRepository, clientRepo *MockClientRepository) {
				user, _ := userDomain.NewUserWithRole("jane@example.com", "password123", userDomain.RoleTherapist)
				user.ID = "therapist-123"
				userRepo.users[user.ID] = user
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userRepo := NewMockUserRepository()
			clientRepo := NewMockClientRepository()
			tt.setup(userRepo, clientRepo)

			service := NewClientService(clientRepo, userRepo)

			profile, err := service.CreateProfile(context.Background(), tt.userID, tt.request)

			if tt.wantErr {
				if err == nil {
					t.Errorf("CreateProfile() expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("CreateProfile() unexpected error = %v", err)
				return
			}

			if profile.FirstName != tt.request.FirstName {
				t.Errorf("CreateProfile() FirstName = %v, want %v", profile.FirstName, tt.request.FirstName)
			}

			if profile.LastName != tt.request.LastName {
				t.Errorf("CreateProfile() LastName = %v, want %v", profile.LastName, tt.request.LastName)
			}
		})
	}
}

func TestClientService_GetProfile(t *testing.T) {
	userRepo := NewMockUserRepository()
	clientRepo := NewMockClientRepository()

	// Setup test user and profile
	user, _ := userDomain.NewUserWithRole("john@example.com", "password123", userDomain.RoleClient)
	user.ID = "user-123"
	userRepo.users[user.ID] = user

	profile, _ := clientDomain.NewClientProfile("user-123", "John", "Doe")
	clientRepo.profiles[profile.UserID] = profile

	service := NewClientService(clientRepo, userRepo)

	t.Run("successful get profile", func(t *testing.T) {
		result, err := service.GetProfile(context.Background(), "user-123")

		if err != nil {
			t.Errorf("GetProfile() unexpected error = %v", err)
			return
		}

		if result.FirstName != "John" {
			t.Errorf("GetProfile() FirstName = %v, want %v", result.FirstName, "John")
		}
	})

	t.Run("profile not found", func(t *testing.T) {
		_, err := service.GetProfile(context.Background(), "nonexistent")

		if err == nil {
			t.Error("GetProfile() expected error but got none")
		}
	})
}
