package therapist

import (
	"errors"
	"strings"
	"time"
)

type TherapistProfile struct {
	UserID             string
	FirstName          string
	LastName           string
	LicenseNumber      string
	Specializations    []string
	Phone              string
	Bio                string
	IsAcceptingClients bool
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

func NewTherapistProfile(userID, firstName, lastName, licenseNumber string) (*TherapistProfile, error) {
	if err := validateUserID(userID); err != nil {
		return nil, err
	}

	if err := validateFirstName(firstName); err != nil {
		return nil, err
	}

	if err := validateLastName(lastName); err != nil {
		return nil, err
	}

	if err := validateLicenseNumber(licenseNumber); err != nil {
		return nil, err
	}

	now := time.Now()
	return &TherapistProfile{
		UserID:             userID,
		FirstName:          strings.TrimSpace(firstName),
		LastName:           strings.TrimSpace(lastName),
		LicenseNumber:      strings.TrimSpace(licenseNumber),
		Specializations:    []string{},
		IsAcceptingClients: true,
		CreatedAt:          now,
		UpdatedAt:          now,
	}, nil
}

func (t *TherapistProfile) UpdatePersonalInfo(firstName, lastName string) error {
	if err := validateFirstName(firstName); err != nil {
		return err
	}

	if err := validateLastName(lastName); err != nil {
		return err
	}

	t.FirstName = strings.TrimSpace(firstName)
	t.LastName = strings.TrimSpace(lastName)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *TherapistProfile) UpdateLicenseNumber(licenseNumber string) error {
	if err := validateLicenseNumber(licenseNumber); err != nil {
		return err
	}

	t.LicenseNumber = strings.TrimSpace(licenseNumber)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *TherapistProfile) UpdateSpecializations(specializations []string) {
	t.Specializations = make([]string, len(specializations))
	copy(t.Specializations, specializations)
	t.UpdatedAt = time.Now()
}

func (t *TherapistProfile) AddSpecialization(specialization string) error {
	specialization = strings.TrimSpace(specialization)
	if specialization == "" {
		return errors.New("specialization cannot be empty")
	}

	for _, existing := range t.Specializations {
		if existing == specialization {
			return errors.New("specialization already exists")
		}
	}

	t.Specializations = append(t.Specializations, specialization)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *TherapistProfile) RemoveSpecialization(specialization string) error {
	index := -1
	for i, existing := range t.Specializations {
		if existing == specialization {
			index = i
			break
		}
	}

	if index == -1 {
		return errors.New("specialization not found")
	}

	t.Specializations = append(t.Specializations[:index], t.Specializations[index+1:]...)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *TherapistProfile) HasSpecialization(specialization string) bool {
	for _, existing := range t.Specializations {
		if existing == specialization {
			return true
		}
	}
	return false
}

func (t *TherapistProfile) UpdateContactInfo(phone string) error {
	if err := validatePhone(phone); err != nil {
		return err
	}

	t.Phone = strings.TrimSpace(phone)
	t.UpdatedAt = time.Now()
	return nil
}

func (t *TherapistProfile) UpdateBio(bio string) {
	t.Bio = strings.TrimSpace(bio)
	t.UpdatedAt = time.Now()
}

func (t *TherapistProfile) SetAcceptingClients(accepting bool) {
	t.IsAcceptingClients = accepting
	t.UpdatedAt = time.Now()
}

func (t *TherapistProfile) GetFullName() string {
	return t.FirstName + " " + t.LastName
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

func validateLicenseNumber(licenseNumber string) error {
	licenseNumber = strings.TrimSpace(licenseNumber)
	if licenseNumber == "" {
		return errors.New("license number is required")
	}

	if len(licenseNumber) > 50 {
		return errors.New("license number must be 50 characters or less")
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
