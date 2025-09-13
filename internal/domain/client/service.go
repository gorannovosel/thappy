package client

import (
	"context"
	"errors"
)

var (
	ErrClientServiceUnavailable = errors.New("client service unavailable")
	ErrUnauthorizedAccess       = errors.New("unauthorized access to client data")
)

type ClientService interface {
	CreateProfile(ctx context.Context, userID string, req CreateProfileRequest) (*ClientProfile, error)
	GetProfile(ctx context.Context, userID string) (*ClientProfile, error)
	UpdatePersonalInfo(ctx context.Context, userID string, req UpdatePersonalInfoRequest) (*ClientProfile, error)
	UpdateContactInfo(ctx context.Context, userID string, req UpdateContactInfoRequest) (*ClientProfile, error)
	SetDateOfBirth(ctx context.Context, userID string, req SetDateOfBirthRequest) (*ClientProfile, error)
	AssignTherapist(ctx context.Context, clientUserID, therapistUserID string) error
	UnassignTherapist(ctx context.Context, clientUserID string) error
	UpdateNotes(ctx context.Context, clientUserID string, notes string) error
	GetClientsByTherapist(ctx context.Context, therapistUserID string) ([]*ClientProfile, error)
	GetActiveClients(ctx context.Context) ([]*ClientProfile, error)
	DeleteProfile(ctx context.Context, userID string) error
}

type CreateProfileRequest struct {
	FirstName        string
	LastName         string
	Phone            string
	EmergencyContact string
}

type UpdatePersonalInfoRequest struct {
	FirstName string
	LastName  string
}

type UpdateContactInfoRequest struct {
	Phone            string
	EmergencyContact string
}

type SetDateOfBirthRequest struct {
	DateOfBirth *string
}
