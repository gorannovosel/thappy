package therapy

import (
	"context"
	"errors"
)

var (
	ErrTherapyNotFound      = errors.New("therapy not found")
	ErrTherapyAlreadyExists = errors.New("therapy already exists")
)

type Repository interface {
	Create(ctx context.Context, therapy *Therapy) error
	GetByID(ctx context.Context, id string) (*Therapy, error)
	GetAll(ctx context.Context) ([]*Therapy, error)
	GetAllActive(ctx context.Context) ([]*Therapy, error)
	Update(ctx context.Context, therapy *Therapy) error
	Delete(ctx context.Context, id string) error
}
