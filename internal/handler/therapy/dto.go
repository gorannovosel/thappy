package therapy

import (
	"time"

	"github.com/goran/thappy/internal/domain/therapy"
)

// Request DTOs
type CreateTherapyRequest struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	ShortDescription string `json:"short_description"`
	Icon             string `json:"icon"`
	DetailedInfo     string `json:"detailed_info"`
	WhenNeeded       string `json:"when_needed"`
}

type UpdateTherapyRequest struct {
	Title            string `json:"title,omitempty"`
	ShortDescription string `json:"short_description,omitempty"`
	Icon             string `json:"icon,omitempty"`
	DetailedInfo     string `json:"detailed_info,omitempty"`
	WhenNeeded       string `json:"when_needed,omitempty"`
}

// Response DTOs
type TherapyResponse struct {
	ID               string    `json:"id"`
	Title            string    `json:"title"`
	ShortDescription string    `json:"short_description"`
	Icon             string    `json:"icon"`
	DetailedInfo     string    `json:"detailed_info"`
	WhenNeeded       string    `json:"when_needed"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type CreateTherapyResponse struct {
	Therapy TherapyResponse `json:"therapy"`
	Message string          `json:"message"`
}

type TherapyListResponse struct {
	Therapies []TherapyResponse `json:"therapies"`
}

type TherapyDetailResponse struct {
	Therapy TherapyResponse `json:"therapy"`
}

// Helper functions to convert domain models to DTOs
func ToTherapyResponse(t *therapy.Therapy) TherapyResponse {
	return TherapyResponse{
		ID:               t.ID,
		Title:            t.Title,
		ShortDescription: t.ShortDescription,
		Icon:             t.Icon,
		DetailedInfo:     t.DetailedInfo,
		WhenNeeded:       t.WhenNeeded,
		IsActive:         t.IsActive,
		CreatedAt:        t.CreatedAt,
		UpdatedAt:        t.UpdatedAt,
	}
}

func ToTherapyListResponse(therapies []*therapy.Therapy) TherapyListResponse {
	responses := make([]TherapyResponse, len(therapies))
	for i, t := range therapies {
		responses[i] = ToTherapyResponse(t)
	}
	return TherapyListResponse{
		Therapies: responses,
	}
}

// Validation functions
func (r *CreateTherapyRequest) Validate() error {
	if r.ID == "" {
		return ErrMissingTherapyID
	}
	if r.Title == "" {
		return ErrMissingTitle
	}
	if r.ShortDescription == "" {
		return ErrMissingShortDescription
	}
	if r.Icon == "" {
		return ErrMissingIcon
	}
	if r.DetailedInfo == "" {
		return ErrMissingDetailedInfo
	}
	if r.WhenNeeded == "" {
		return ErrMissingWhenNeeded
	}
	return nil
}

func (r *UpdateTherapyRequest) Validate() error {
	// For update requests, at least one field should be provided
	if r.Title == "" && r.ShortDescription == "" && r.Icon == "" && r.DetailedInfo == "" && r.WhenNeeded == "" {
		return ErrNoFieldsToUpdate
	}
	return nil
}