package therapist

import (
	"context"
	"errors"
)

var (
	ErrTherapistServiceUnavailable = errors.New("therapist service unavailable")
	ErrUnauthorizedAccess          = errors.New("unauthorized access to therapist data")
)

type TherapistService interface {
	CreateProfile(ctx context.Context, userID string, req CreateProfileRequest) (*TherapistProfile, error)
	GetProfile(ctx context.Context, userID string) (*TherapistProfile, error)
	GetByLicenseNumber(ctx context.Context, licenseNumber string) (*TherapistProfile, error)
	UpdatePersonalInfo(ctx context.Context, userID string, req UpdatePersonalInfoRequest) (*TherapistProfile, error)
	UpdateLicenseNumber(ctx context.Context, userID string, licenseNumber string) (*TherapistProfile, error)
	UpdateContactInfo(ctx context.Context, userID string, req UpdateContactInfoRequest) (*TherapistProfile, error)
	UpdateBio(ctx context.Context, userID string, bio string) (*TherapistProfile, error)
	UpdateSpecializations(ctx context.Context, userID string, specializations []string) (*TherapistProfile, error)
	AddSpecialization(ctx context.Context, userID, specialization string) (*TherapistProfile, error)
	RemoveSpecialization(ctx context.Context, userID, specialization string) (*TherapistProfile, error)
	SetAcceptingClients(ctx context.Context, userID string, accepting bool) (*TherapistProfile, error)
	GetAcceptingClients(ctx context.Context) ([]*TherapistProfile, error)
	GetBySpecialization(ctx context.Context, specialization string) ([]*TherapistProfile, error)
	SearchTherapists(ctx context.Context, filters TherapistSearchFilters) ([]*TherapistProfile, error)
	DeleteProfile(ctx context.Context, userID string) error
	ValidateLicenseNumber(ctx context.Context, licenseNumber string) error
}

type CreateProfileRequest struct {
	FirstName     string
	LastName      string
	LicenseNumber string
	Phone         string
	Bio           string
}

type UpdatePersonalInfoRequest struct {
	FirstName string
	LastName  string
}

type UpdateContactInfoRequest struct {
	Phone string
}
