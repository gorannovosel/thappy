package client

import (
	"errors"
	"strings"
	"time"
)

type ClientProfile struct {
	UserID           string
	FirstName        string
	LastName         string
	DateOfBirth      *time.Time
	Phone            string
	EmergencyContact string
	TherapistID      *string
	Notes            string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func NewClientProfile(userID, firstName, lastName string) (*ClientProfile, error) {
	if err := validateUserID(userID); err != nil {
		return nil, err
	}

	if err := validateFirstName(firstName); err != nil {
		return nil, err
	}

	if err := validateLastName(lastName); err != nil {
		return nil, err
	}

	now := time.Now()
	return &ClientProfile{
		UserID:    userID,
		FirstName: strings.TrimSpace(firstName),
		LastName:  strings.TrimSpace(lastName),
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

func (c *ClientProfile) UpdatePersonalInfo(firstName, lastName string) error {
	if err := validateFirstName(firstName); err != nil {
		return err
	}

	if err := validateLastName(lastName); err != nil {
		return err
	}

	c.FirstName = strings.TrimSpace(firstName)
	c.LastName = strings.TrimSpace(lastName)
	c.UpdatedAt = time.Now()
	return nil
}

func (c *ClientProfile) UpdateContactInfo(phone, emergencyContact string) error {
	if err := validatePhone(phone); err != nil {
		return err
	}

	if err := validateEmergencyContact(emergencyContact); err != nil {
		return err
	}

	c.Phone = strings.TrimSpace(phone)
	c.EmergencyContact = strings.TrimSpace(emergencyContact)
	c.UpdatedAt = time.Now()
	return nil
}

func (c *ClientProfile) SetDateOfBirth(birthDate *time.Time) error {
	if birthDate != nil && birthDate.After(time.Now()) {
		return errors.New("birth date cannot be in the future")
	}

	c.DateOfBirth = birthDate
	c.UpdatedAt = time.Now()
	return nil
}

func (c *ClientProfile) AssignTherapist(therapistID *string) {
	c.TherapistID = therapistID
	c.UpdatedAt = time.Now()
}

func (c *ClientProfile) UpdateNotes(notes string) {
	c.Notes = strings.TrimSpace(notes)
	c.UpdatedAt = time.Now()
}

func (c *ClientProfile) GetFullName() string {
	return c.FirstName + " " + c.LastName
}

func validateUserID(userID string) error {
	if userID == "" {
		return errors.New("user ID is required")
	}
	return nil
}

func validateFirstName(firstName string) error {
	firstName = strings.TrimSpace(firstName)
	if firstName == "" {
		return errors.New("first name is required")
	}

	if len(firstName) > 100 {
		return errors.New("first name must be 100 characters or less")
	}

	return nil
}

func validateLastName(lastName string) error {
	lastName = strings.TrimSpace(lastName)
	if lastName == "" {
		return errors.New("last name is required")
	}

	if len(lastName) > 100 {
		return errors.New("last name must be 100 characters or less")
	}

	return nil
}

func validatePhone(phone string) error {
	phone = strings.TrimSpace(phone)
	if len(phone) > 20 {
		return errors.New("phone must be 20 characters or less")
	}
	return nil
}

func validateEmergencyContact(emergencyContact string) error {
	emergencyContact = strings.TrimSpace(emergencyContact)
	if len(emergencyContact) > 255 {
		return errors.New("emergency contact must be 255 characters or less")
	}
	return nil
}
