package therapy

import (
	"errors"
	"strings"
	"time"
)

type Therapy struct {
	ID               string
	Title            string
	ShortDescription string
	Icon             string
	DetailedInfo     string
	WhenNeeded       string
	IsActive         bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func NewTherapy(id, title, shortDescription, icon, detailedInfo, whenNeeded string) (*Therapy, error) {
	if err := validateID(id); err != nil {
		return nil, err
	}

	if err := validateTitle(title); err != nil {
		return nil, err
	}

	if err := validateShortDescription(shortDescription); err != nil {
		return nil, err
	}

	if err := validateIcon(icon); err != nil {
		return nil, err
	}

	if err := validateDetailedInfo(detailedInfo); err != nil {
		return nil, err
	}

	if err := validateWhenNeeded(whenNeeded); err != nil {
		return nil, err
	}

	now := time.Now()
	return &Therapy{
		ID:               strings.ToLower(strings.TrimSpace(id)),
		Title:            strings.TrimSpace(title),
		ShortDescription: strings.TrimSpace(shortDescription),
		Icon:             strings.TrimSpace(icon),
		DetailedInfo:     strings.TrimSpace(detailedInfo),
		WhenNeeded:       strings.TrimSpace(whenNeeded),
		IsActive:         true,
		CreatedAt:        now,
		UpdatedAt:        now,
	}, nil
}

func (t *Therapy) UpdateTitle(newTitle string) error {
	if err := validateTitle(newTitle); err != nil {
		return err
	}

	t.Title = strings.TrimSpace(newTitle)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *Therapy) UpdateShortDescription(newDescription string) error {
	if err := validateShortDescription(newDescription); err != nil {
		return err
	}

	t.ShortDescription = strings.TrimSpace(newDescription)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *Therapy) UpdateIcon(newIcon string) error {
	if err := validateIcon(newIcon); err != nil {
		return err
	}

	t.Icon = strings.TrimSpace(newIcon)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *Therapy) UpdateDetailedInfo(newDetailedInfo string) error {
	if err := validateDetailedInfo(newDetailedInfo); err != nil {
		return err
	}

	t.DetailedInfo = strings.TrimSpace(newDetailedInfo)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *Therapy) UpdateWhenNeeded(newWhenNeeded string) error {
	if err := validateWhenNeeded(newWhenNeeded); err != nil {
		return err
	}

	t.WhenNeeded = strings.TrimSpace(newWhenNeeded)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *Therapy) SetActive(active bool) {
	t.IsActive = active
	t.UpdatedAt = time.Now()
}

func validateID(id string) error {
	id = strings.TrimSpace(id)
	if id == "" {
		return errors.New("therapy ID is required")
	}

	if len(id) < 3 {
		return errors.New("therapy ID must be at least 3 characters")
	}

	// Check for valid URL slug format (letters, numbers, hyphens)
	for _, char := range id {
		if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
			return errors.New("therapy ID must contain only lowercase letters, numbers, and hyphens")
		}
	}

	return nil
}

func validateTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return errors.New("therapy title is required")
	}

	if len(title) < 3 {
		return errors.New("therapy title must be at least 3 characters")
	}

	return nil
}

func validateShortDescription(description string) error {
	description = strings.TrimSpace(description)
	if description == "" {
		return errors.New("therapy short description is required")
	}

	if len(description) < 10 {
		return errors.New("therapy short description must be at least 10 characters")
	}

	return nil
}

func validateIcon(icon string) error {
	icon = strings.TrimSpace(icon)
	if icon == "" {
		return errors.New("therapy icon is required")
	}

	return nil
}

func validateDetailedInfo(detailedInfo string) error {
	detailedInfo = strings.TrimSpace(detailedInfo)
	if detailedInfo == "" {
		return errors.New("therapy detailed info is required")
	}

	if len(detailedInfo) < 20 {
		return errors.New("therapy detailed info must be at least 20 characters")
	}

	return nil
}

func validateWhenNeeded(whenNeeded string) error {
	whenNeeded = strings.TrimSpace(whenNeeded)
	if whenNeeded == "" {
		return errors.New("therapy when needed is required")
	}

	if len(whenNeeded) < 20 {
		return errors.New("therapy when needed must be at least 20 characters")
	}

	return nil
}
