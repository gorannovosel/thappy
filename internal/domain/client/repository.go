package client

import (
	"context"
	"errors"
)

var (
	ErrClientProfileNotFound      = errors.New("client profile not found")
	ErrClientProfileAlreadyExists = errors.New("client profile already exists")
	ErrInvalidClientData          = errors.New("invalid client data")
)

type ClientRepository interface {
	Create(ctx context.Context, profile *ClientProfile) error
	GetByUserID(ctx context.Context, userID string) (*ClientProfile, error)
	Update(ctx context.Context, profile *ClientProfile) error
	Delete(ctx context.Context, userID string) error
	GetByTherapistID(ctx context.Context, therapistID string) ([]*ClientProfile, error)
	GetActiveClients(ctx context.Context) ([]*ClientProfile, error)
	ExistsByUserID(ctx context.Context, userID string) (bool, error)
}
