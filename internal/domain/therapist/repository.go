package therapist

import (
	"context"
	"errors"
)

var (
	ErrTherapistProfileNotFound      = errors.New("therapist profile not found")
	ErrTherapistProfileAlreadyExists = errors.New("therapist profile already exists")
	ErrInvalidTherapistData          = errors.New("invalid therapist data")
	ErrLicenseNumberAlreadyExists    = errors.New("license number already exists")
)

type TherapistRepository interface {
	Create(ctx context.Context, profile *TherapistProfile) error
	GetByUserID(ctx context.Context, userID string) (*TherapistProfile, error)
	GetByLicenseNumber(ctx context.Context, licenseNumber string) (*TherapistProfile, error)
	Update(ctx context.Context, profile *TherapistProfile) error
	Delete(ctx context.Context, userID string) error
	GetAcceptingClients(ctx context.Context) ([]*TherapistProfile, error)
	GetBySpecialization(ctx context.Context, specialization string) ([]*TherapistProfile, error)
	SearchTherapists(ctx context.Context, filters TherapistSearchFilters) ([]*TherapistProfile, error)
	ExistsByUserID(ctx context.Context, userID string) (bool, error)
	ExistsByLicenseNumber(ctx context.Context, licenseNumber string) (bool, error)
}

type TherapistSearchFilters struct {
	Specializations  []string
	AcceptingClients *bool
	SearchText       string
	Limit            int
	Offset           int
}
