package therapy

import (
	"context"
	"strings"

	"github.com/goran/thappy/internal/domain/therapy"
)

type TherapyService struct {
	repo therapy.Repository
}

func NewTherapyService(repo therapy.Repository) *TherapyService {
	return &TherapyService{
		repo: repo,
	}
}

func (s *TherapyService) CreateTherapy(ctx context.Context, id, title, shortDescription, icon, detailedInfo, whenNeeded string) (*therapy.Therapy, error) {
	// Normalize ID to lowercase slug format
	id = strings.ToLower(strings.TrimSpace(id))

	// Check if therapy already exists
	existingTherapy, err := s.repo.GetByID(ctx, id)
	if err == nil && existingTherapy != nil {
		return nil, therapy.ErrTherapyAlreadyExists
	}
	if err != nil && err != therapy.ErrTherapyNotFound {
		return nil, err
	}

	// Create new therapy
	therapyEntity, err := therapy.NewTherapy(id, title, shortDescription, icon, detailedInfo, whenNeeded)
	if err != nil {
		return nil, err
	}

	// Save to repository
	if err := s.repo.Create(ctx, therapyEntity); err != nil {
		return nil, err
	}

	return therapyEntity, nil
}

func (s *TherapyService) GetTherapy(ctx context.Context, id string) (*therapy.Therapy, error) {
	id = strings.ToLower(strings.TrimSpace(id))
	return s.repo.GetByID(ctx, id)
}

func (s *TherapyService) ListTherapies(ctx context.Context) ([]*therapy.Therapy, error) {
	return s.repo.GetAll(ctx)
}

func (s *TherapyService) ListActiveTherapies(ctx context.Context) ([]*therapy.Therapy, error) {
	return s.repo.GetAllActive(ctx)
}

func (s *TherapyService) UpdateTherapy(ctx context.Context, therapyEntity *therapy.Therapy) error {
	return s.repo.Update(ctx, therapyEntity)
}

func (s *TherapyService) DeleteTherapy(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))
	return s.repo.Delete(ctx, id)
}

func (s *TherapyService) DeactivateTherapy(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))

	therapyEntity, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	therapyEntity.SetActive(false)

	return s.repo.Update(ctx, therapyEntity)
}

func (s *TherapyService) ActivateTherapy(ctx context.Context, id string) error {
	id = strings.ToLower(strings.TrimSpace(id))

	therapyEntity, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	therapyEntity.SetActive(true)

	return s.repo.Update(ctx, therapyEntity)
}