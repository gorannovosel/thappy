package therapist

import (
	"context"
	"strings"

	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	userDomain "github.com/goran/thappy/internal/domain/user"
)

type TherapistService struct {
	therapistRepo therapistDomain.TherapistRepository
	userRepo      userDomain.UserRepository
}

func NewTherapistService(therapistRepo therapistDomain.TherapistRepository, userRepo userDomain.UserRepository) *TherapistService {
	return &TherapistService{
		therapistRepo: therapistRepo,
		userRepo:      userRepo,
	}
}

func (s *TherapistService) CreateProfile(ctx context.Context, userID string, req therapistDomain.CreateProfileRequest) (*therapistDomain.TherapistProfile, error) {
	// Verify user exists and is a therapist
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return nil, therapistDomain.ErrInvalidTherapistData
		}
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}

	if !user.IsTherapist() {
		return nil, therapistDomain.ErrUnauthorizedAccess
	}

	// Check if profile already exists
	exists, err := s.therapistRepo.ExistsByUserID(ctx, userID)
	if err != nil {
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}
	if exists {
		return nil, therapistDomain.ErrTherapistProfileAlreadyExists
	}

	// Validate license number uniqueness
	licenseExists, err := s.therapistRepo.ExistsByLicenseNumber(ctx, req.LicenseNumber)
	if err != nil {
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}
	if licenseExists {
		return nil, therapistDomain.ErrLicenseNumberAlreadyExists
	}

	// Create the profile
	profile, err := therapistDomain.NewTherapistProfile(userID, req.FirstName, req.LastName, req.LicenseNumber)
	if err != nil {
		return nil, err
	}

	// Update additional info if provided
	if req.Phone != "" {
		err = profile.UpdateContactInfo(req.Phone)
		if err != nil {
			return nil, err
		}
	}

	if req.Bio != "" {
		profile.UpdateBio(req.Bio)
	}

	// Save to repository
	err = s.therapistRepo.Create(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) GetProfile(ctx context.Context, userID string) (*therapistDomain.TherapistProfile, error) {
	// Verify user exists and is a therapist
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return nil, therapistDomain.ErrTherapistProfileNotFound
		}
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}

	if !user.IsTherapist() {
		return nil, therapistDomain.ErrUnauthorizedAccess
	}

	profile, err := s.therapistRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) GetByLicenseNumber(ctx context.Context, licenseNumber string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.therapistRepo.GetByLicenseNumber(ctx, licenseNumber)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) UpdatePersonalInfo(ctx context.Context, userID string, req therapistDomain.UpdatePersonalInfoRequest) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.UpdatePersonalInfo(req.FirstName, req.LastName)
	if err != nil {
		return nil, err
	}

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) UpdateLicenseNumber(ctx context.Context, userID string, licenseNumber string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Check if new license number is already taken
	if profile.LicenseNumber != licenseNumber {
		exists, err := s.therapistRepo.ExistsByLicenseNumber(ctx, licenseNumber)
		if err != nil {
			return nil, therapistDomain.ErrTherapistServiceUnavailable
		}
		if exists {
			return nil, therapistDomain.ErrLicenseNumberAlreadyExists
		}
	}

	err = profile.UpdateLicenseNumber(licenseNumber)
	if err != nil {
		return nil, err
	}

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) UpdateContactInfo(ctx context.Context, userID string, req therapistDomain.UpdateContactInfoRequest) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.UpdateContactInfo(req.Phone)
	if err != nil {
		return nil, err
	}

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) UpdateBio(ctx context.Context, userID string, bio string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	profile.UpdateBio(bio)

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) UpdateSpecializations(ctx context.Context, userID string, specializations []string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Clean and validate specializations
	cleanedSpecs := make([]string, 0, len(specializations))
	for _, spec := range specializations {
		clean := strings.TrimSpace(spec)
		if clean != "" {
			cleanedSpecs = append(cleanedSpecs, clean)
		}
	}

	profile.UpdateSpecializations(cleanedSpecs)

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) AddSpecialization(ctx context.Context, userID, specialization string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.AddSpecialization(specialization)
	if err != nil {
		return nil, err
	}

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) RemoveSpecialization(ctx context.Context, userID, specialization string) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.RemoveSpecialization(specialization)
	if err != nil {
		return nil, err
	}

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) SetAcceptingClients(ctx context.Context, userID string, accepting bool) (*therapistDomain.TherapistProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	profile.SetAcceptingClients(accepting)

	err = s.therapistRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *TherapistService) GetAcceptingClients(ctx context.Context) ([]*therapistDomain.TherapistProfile, error) {
	profiles, err := s.therapistRepo.GetAcceptingClients(ctx)
	if err != nil {
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}

	return profiles, nil
}

func (s *TherapistService) GetBySpecialization(ctx context.Context, specialization string) ([]*therapistDomain.TherapistProfile, error) {
	profiles, err := s.therapistRepo.GetBySpecialization(ctx, specialization)
	if err != nil {
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}

	return profiles, nil
}

func (s *TherapistService) SearchTherapists(ctx context.Context, filters therapistDomain.TherapistSearchFilters) ([]*therapistDomain.TherapistProfile, error) {
	profiles, err := s.therapistRepo.SearchTherapists(ctx, filters)
	if err != nil {
		return nil, therapistDomain.ErrTherapistServiceUnavailable
	}

	return profiles, nil
}

func (s *TherapistService) DeleteProfile(ctx context.Context, userID string) error {
	// Verify access (user must exist and be a therapist)
	_, err := s.GetProfile(ctx, userID)
	if err != nil {
		return err
	}

	err = s.therapistRepo.Delete(ctx, userID)
	if err != nil {
		return err
	}

	return nil
}

func (s *TherapistService) ValidateLicenseNumber(ctx context.Context, licenseNumber string) error {
	exists, err := s.therapistRepo.ExistsByLicenseNumber(ctx, licenseNumber)
	if err != nil {
		return therapistDomain.ErrTherapistServiceUnavailable
	}

	if exists {
		return therapistDomain.ErrLicenseNumberAlreadyExists
	}

	return nil
}
