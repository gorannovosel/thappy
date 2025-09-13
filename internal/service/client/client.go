package client

import (
	"context"
	"fmt"
	"time"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	userDomain "github.com/goran/thappy/internal/domain/user"
)

type ClientService struct {
	clientRepo clientDomain.ClientRepository
	userRepo   userDomain.UserRepository
}

func NewClientService(clientRepo clientDomain.ClientRepository, userRepo userDomain.UserRepository) *ClientService {
	return &ClientService{
		clientRepo: clientRepo,
		userRepo:   userRepo,
	}
}

func (s *ClientService) CreateProfile(ctx context.Context, userID string, req clientDomain.CreateProfileRequest) (*clientDomain.ClientProfile, error) {
	// Verify user exists and is a client
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return nil, clientDomain.ErrInvalidClientData
		}
		return nil, clientDomain.ErrClientServiceUnavailable
	}

	if !user.IsClient() {
		return nil, clientDomain.ErrUnauthorizedAccess
	}

	// Check if profile already exists
	exists, err := s.clientRepo.ExistsByUserID(ctx, userID)
	if err != nil {
		return nil, clientDomain.ErrClientServiceUnavailable
	}
	if exists {
		return nil, clientDomain.ErrClientProfileAlreadyExists
	}

	// Create the profile
	profile, err := clientDomain.NewClientProfile(userID, req.FirstName, req.LastName)
	if err != nil {
		return nil, err
	}

	// Update contact info if provided
	if req.Phone != "" || req.EmergencyContact != "" {
		err = profile.UpdateContactInfo(req.Phone, req.EmergencyContact)
		if err != nil {
			return nil, err
		}
	}

	// Save to repository
	err = s.clientRepo.Create(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ClientService) GetProfile(ctx context.Context, userID string) (*clientDomain.ClientProfile, error) {
	// Verify user exists and is a client
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return nil, clientDomain.ErrClientProfileNotFound
		}
		return nil, clientDomain.ErrClientServiceUnavailable
	}

	if !user.IsClient() {
		return nil, clientDomain.ErrUnauthorizedAccess
	}

	profile, err := s.clientRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ClientService) UpdatePersonalInfo(ctx context.Context, userID string, req clientDomain.UpdatePersonalInfoRequest) (*clientDomain.ClientProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.UpdatePersonalInfo(req.FirstName, req.LastName)
	if err != nil {
		return nil, err
	}

	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ClientService) UpdateContactInfo(ctx context.Context, userID string, req clientDomain.UpdateContactInfoRequest) (*clientDomain.ClientProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	err = profile.UpdateContactInfo(req.Phone, req.EmergencyContact)
	if err != nil {
		return nil, err
	}

	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ClientService) SetDateOfBirth(ctx context.Context, userID string, req clientDomain.SetDateOfBirthRequest) (*clientDomain.ClientProfile, error) {
	profile, err := s.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	var birthDate *time.Time
	if req.DateOfBirth != nil {
		parsed, err := time.Parse("2006-01-02", *req.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("invalid date format, use YYYY-MM-DD: %w", err)
		}
		birthDate = &parsed
	}

	err = profile.SetDateOfBirth(birthDate)
	if err != nil {
		return nil, err
	}

	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ClientService) AssignTherapist(ctx context.Context, clientUserID, therapistUserID string) error {
	// Verify therapist exists and is active
	therapist, err := s.userRepo.GetByID(ctx, therapistUserID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return clientDomain.ErrInvalidClientData
		}
		return clientDomain.ErrClientServiceUnavailable
	}

	if !therapist.IsTherapist() || !therapist.IsActive {
		return clientDomain.ErrInvalidClientData
	}

	// Get client profile
	profile, err := s.GetProfile(ctx, clientUserID)
	if err != nil {
		return err
	}

	// Assign therapist
	profile.AssignTherapist(&therapistUserID)

	// Update in repository
	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return err
	}

	return nil
}

func (s *ClientService) UnassignTherapist(ctx context.Context, clientUserID string) error {
	profile, err := s.GetProfile(ctx, clientUserID)
	if err != nil {
		return err
	}

	profile.AssignTherapist(nil)

	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return err
	}

	return nil
}

func (s *ClientService) UpdateNotes(ctx context.Context, clientUserID string, notes string) error {
	profile, err := s.GetProfile(ctx, clientUserID)
	if err != nil {
		return err
	}

	profile.UpdateNotes(notes)

	err = s.clientRepo.Update(ctx, profile)
	if err != nil {
		return err
	}

	return nil
}

func (s *ClientService) GetClientsByTherapist(ctx context.Context, therapistUserID string) ([]*clientDomain.ClientProfile, error) {
	// Verify therapist exists and is active
	therapist, err := s.userRepo.GetByID(ctx, therapistUserID)
	if err != nil {
		if err == userDomain.ErrUserNotFound {
			return nil, clientDomain.ErrUnauthorizedAccess
		}
		return nil, clientDomain.ErrClientServiceUnavailable
	}

	if !therapist.IsTherapist() || !therapist.IsActive {
		return nil, clientDomain.ErrUnauthorizedAccess
	}

	profiles, err := s.clientRepo.GetByTherapistID(ctx, therapistUserID)
	if err != nil {
		return nil, clientDomain.ErrClientServiceUnavailable
	}

	return profiles, nil
}

func (s *ClientService) GetActiveClients(ctx context.Context) ([]*clientDomain.ClientProfile, error) {
	profiles, err := s.clientRepo.GetActiveClients(ctx)
	if err != nil {
		return nil, clientDomain.ErrClientServiceUnavailable
	}

	return profiles, nil
}

func (s *ClientService) DeleteProfile(ctx context.Context, userID string) error {
	// Verify access (user must exist and be a client)
	_, err := s.GetProfile(ctx, userID)
	if err != nil {
		return err
	}

	err = s.clientRepo.Delete(ctx, userID)
	if err != nil {
		return err
	}

	return nil
}
