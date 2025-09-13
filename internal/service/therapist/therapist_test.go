package therapist

import (
	"context"
	"testing"

	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	userDomain "github.com/goran/thappy/internal/domain/user"
)

// MockTherapistRepository is a mock implementation of therapistDomain.TherapistRepository
type MockTherapistRepository struct {
	profiles       map[string]*therapistDomain.TherapistProfile
	licenseIndex   map[string]string
	shouldFailNext bool
	failError      error
}

func NewMockTherapistRepository() *MockTherapistRepository {
	return &MockTherapistRepository{
		profiles:     make(map[string]*therapistDomain.TherapistProfile),
		licenseIndex: make(map[string]string),
	}
}

func (m *MockTherapistRepository) Create(ctx context.Context, profile *therapistDomain.TherapistProfile) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.profiles[profile.UserID]; exists {
		return therapistDomain.ErrTherapistProfileAlreadyExists
	}

	if _, exists := m.licenseIndex[profile.LicenseNumber]; exists {
		return therapistDomain.ErrLicenseNumberAlreadyExists
	}

	m.profiles[profile.UserID] = profile
	m.licenseIndex[profile.LicenseNumber] = profile.UserID
	return nil
}

func (m *MockTherapistRepository) GetByUserID(ctx context.Context, userID string) (*therapistDomain.TherapistProfile, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	profile, exists := m.profiles[userID]
	if !exists {
		return nil, therapistDomain.ErrTherapistProfileNotFound
	}
	return profile, nil
}

func (m *MockTherapistRepository) ExistsByUserID(ctx context.Context, userID string) (bool, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return false, m.failError
	}

	_, exists := m.profiles[userID]
	return exists, nil
}

func (m *MockTherapistRepository) ExistsByLicenseNumber(ctx context.Context, licenseNumber string) (bool, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return false, m.failError
	}

	_, exists := m.licenseIndex[licenseNumber]
	return exists, nil
}

func (m *MockTherapistRepository) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

// Add other required methods with empty implementations for now
func (m *MockTherapistRepository) GetByLicenseNumber(ctx context.Context, licenseNumber string) (*therapistDomain.TherapistProfile, error) {
	return nil, nil
}
func (m *MockTherapistRepository) Update(ctx context.Context, profile *therapistDomain.TherapistProfile) error {
	return nil
}
func (m *MockTherapistRepository) Delete(ctx context.Context, userID string) error { return nil }
func (m *MockTherapistRepository) GetAcceptingClients(ctx context.Context) ([]*therapistDomain.TherapistProfile, error) {
	return nil, nil
}
func (m *MockTherapistRepository) GetBySpecialization(ctx context.Context, specialization string) ([]*therapistDomain.TherapistProfile, error) {
	return nil, nil
}
func (m *MockTherapistRepository) SearchTherapists(ctx context.Context, filters therapistDomain.TherapistSearchFilters) ([]*therapistDomain.TherapistProfile, error) {
	return nil, nil
}

// MockUserRepository for therapist service testing
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

func TestTherapistService_CreateProfile(t *testing.T) {
	tests := []struct {
		name    string
		userID  string
		request therapistDomain.CreateProfileRequest
		setup   func(*MockUserRepository, *MockTherapistRepository)
		wantErr bool
	}{
		{
			name:   "successful profile creation",
			userID: "therapist-123",
			request: therapistDomain.CreateProfileRequest{
				FirstName:     "Dr. Jane",
				LastName:      "Smith",
				LicenseNumber: "LIC-12345",
				Phone:         "+1-555-0123",
				Bio:           "Experienced therapist",
			},
			setup: func(userRepo *MockUserRepository, therapistRepo *MockTherapistRepository) {
				user, _ := userDomain.NewUserWithRole("jane@example.com", "password123", userDomain.RoleTherapist)
				user.ID = "therapist-123"
				userRepo.users[user.ID] = user
			},
			wantErr: false,
		},
		{
			name:   "user not found",
			userID: "nonexistent",
			request: therapistDomain.CreateProfileRequest{
				FirstName:     "Dr. Jane",
				LastName:      "Smith",
				LicenseNumber: "LIC-12345",
			},
			setup: func(userRepo *MockUserRepository, therapistRepo *MockTherapistRepository) {
				// No setup - user doesn't exist
			},
			wantErr: true,
		},
		{
			name:   "user is not a therapist",
			userID: "client-123",
			request: therapistDomain.CreateProfileRequest{
				FirstName:     "John",
				LastName:      "Doe",
				LicenseNumber: "LIC-12345",
			},
			setup: func(userRepo *MockUserRepository, therapistRepo *MockTherapistRepository) {
				user, _ := userDomain.NewUserWithRole("john@example.com", "password123", userDomain.RoleClient)
				user.ID = "client-123"
				userRepo.users[user.ID] = user
			},
			wantErr: true,
		},
		{
			name:   "license number already exists",
			userID: "therapist-456",
			request: therapistDomain.CreateProfileRequest{
				FirstName:     "Dr. Bob",
				LastName:      "Johnson",
				LicenseNumber: "LIC-12345",
			},
			setup: func(userRepo *MockUserRepository, therapistRepo *MockTherapistRepository) {
				user, _ := userDomain.NewUserWithRole("bob@example.com", "password123", userDomain.RoleTherapist)
				user.ID = "therapist-456"
				userRepo.users[user.ID] = user

				// Add existing license
				therapistRepo.licenseIndex["LIC-12345"] = "existing-user"
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userRepo := NewMockUserRepository()
			therapistRepo := NewMockTherapistRepository()
			tt.setup(userRepo, therapistRepo)

			service := NewTherapistService(therapistRepo, userRepo)

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

			if profile.LicenseNumber != tt.request.LicenseNumber {
				t.Errorf("CreateProfile() LicenseNumber = %v, want %v", profile.LicenseNumber, tt.request.LicenseNumber)
			}
		})
	}
}

func TestTherapistService_ValidateLicenseNumber(t *testing.T) {
	userRepo := NewMockUserRepository()
	therapistRepo := NewMockTherapistRepository()

	// Setup existing license
	therapistRepo.licenseIndex["LIC-EXISTING"] = "existing-user"

	service := NewTherapistService(therapistRepo, userRepo)

	t.Run("license number available", func(t *testing.T) {
		err := service.ValidateLicenseNumber(context.Background(), "LIC-NEW")

		if err != nil {
			t.Errorf("ValidateLicenseNumber() unexpected error = %v", err)
		}
	})

	t.Run("license number already exists", func(t *testing.T) {
		err := service.ValidateLicenseNumber(context.Background(), "LIC-EXISTING")

		if err == nil {
			t.Error("ValidateLicenseNumber() expected error but got none")
		}

		if err != therapistDomain.ErrLicenseNumberAlreadyExists {
			t.Errorf("ValidateLicenseNumber() error = %v, want %v", err, therapistDomain.ErrLicenseNumberAlreadyExists)
		}
	})
}
