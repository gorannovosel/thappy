package therapy

import "context"

type Service interface {
	CreateTherapy(ctx context.Context, id, title, shortDescription, icon, detailedInfo, whenNeeded string) (*Therapy, error)
	GetTherapy(ctx context.Context, id string) (*Therapy, error)
	ListTherapies(ctx context.Context) ([]*Therapy, error)
	ListActiveTherapies(ctx context.Context) ([]*Therapy, error)
	UpdateTherapy(ctx context.Context, therapy *Therapy) error
	DeleteTherapy(ctx context.Context, id string) error
}
