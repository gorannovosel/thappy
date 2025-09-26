package handler

import (
	"time"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	therapyDomain "github.com/goran/thappy/internal/domain/therapy"
	"github.com/goran/thappy/internal/domain/user"
)

// Request DTOs
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UpdateProfileRequest struct {
	Email string `json:"email,omitempty"`
}

// Client Profile Request DTOs
type CreateClientProfileRequest struct {
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	Phone            string `json:"phone,omitempty"`
	EmergencyContact string `json:"emergency_contact,omitempty"`
}

type UpdateClientPersonalInfoRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type UpdateClientContactInfoRequest struct {
	Phone            string `json:"phone,omitempty"`
	EmergencyContact string `json:"emergency_contact,omitempty"`
}

type SetDateOfBirthRequest struct {
	DateOfBirth *string `json:"date_of_birth"`
}

// Therapist Profile Request DTOs
type CreateTherapistProfileRequest struct {
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	LicenseNumber string `json:"license_number"`
	Phone         string `json:"phone,omitempty"`
	Bio           string `json:"bio,omitempty"`
}

type UpdateTherapistPersonalInfoRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type UpdateTherapistContactInfoRequest struct {
	Phone string `json:"phone"`
}

type UpdateTherapistBioRequest struct {
	Bio string `json:"bio"`
}

type UpdateSpecializationsRequest struct {
	Specializations []string `json:"specializations"`
}

type AddSpecializationRequest struct {
	Specialization string `json:"specialization"`
}

type RemoveSpecializationRequest struct {
	Specialization string `json:"specialization"`
}

type SetAcceptingClientsRequest struct {
	AcceptingClients bool `json:"accepting_clients"`
}

type UpdateLicenseNumberRequest struct {
	LicenseNumber string `json:"license_number"`
}

// Role-based Registration Request
type RegisterWithRoleRequest struct {
	Email    string        `json:"email"`
	Password string        `json:"password"`
	Role     user.UserRole `json:"role"`
}

// Response DTOs
type UserResponse struct {
	ID        string        `json:"id"`
	Email     string        `json:"email"`
	Role      user.UserRole `json:"role"`
	IsActive  bool          `json:"is_active"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

// Client Profile Response DTOs
type ClientProfileResponse struct {
	Profile interface{} `json:"profile"`
	Message string      `json:"message,omitempty"`
}

type ClientProfileData struct {
	UserID           string     `json:"user_id"`
	FirstName        string     `json:"first_name"`
	LastName         string     `json:"last_name"`
	Phone            string     `json:"phone,omitempty"`
	EmergencyContact string     `json:"emergency_contact,omitempty"`
	DateOfBirth      *time.Time `json:"date_of_birth,omitempty"`
	TherapistID      *string    `json:"therapist_id,omitempty"`
	Notes            string     `json:"notes,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// Therapist Profile Response DTOs
type TherapistProfileResponse struct {
	Profile interface{} `json:"profile"`
	Message string      `json:"message,omitempty"`
}

type TherapistProfileData struct {
	UserID           string    `json:"user_id"`
	FirstName        string    `json:"first_name"`
	LastName         string    `json:"last_name"`
	LicenseNumber    string    `json:"license_number"`
	Phone            string    `json:"phone,omitempty"`
	Bio              string    `json:"bio,omitempty"`
	Specializations  []string  `json:"specializations"`
	AcceptingClients bool      `json:"accepting_clients"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type RegisterResponse struct {
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

type LoginResponse struct {
	Token   string       `json:"token"`
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

type ProfileResponse struct {
	User UserResponse `json:"user"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

// Helper functions to convert domain models to DTOs
func ToUserResponse(user *user.User) UserResponse {
	return UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

func ToClientProfileResponse(profile *clientDomain.ClientProfile) ClientProfileData {
	return ClientProfileData{
		UserID:           profile.UserID,
		FirstName:        profile.FirstName,
		LastName:         profile.LastName,
		Phone:            profile.Phone,
		EmergencyContact: profile.EmergencyContact,
		DateOfBirth:      profile.DateOfBirth,
		TherapistID:      profile.TherapistID,
		Notes:            profile.Notes,
		CreatedAt:        profile.CreatedAt,
		UpdatedAt:        profile.UpdatedAt,
	}
}

func ToTherapistProfileResponse(profile *therapistDomain.TherapistProfile) TherapistProfileData {
	return TherapistProfileData{
		UserID:           profile.UserID,
		FirstName:        profile.FirstName,
		LastName:         profile.LastName,
		LicenseNumber:    profile.LicenseNumber,
		Phone:            profile.Phone,
		Bio:              profile.Bio,
		Specializations:  profile.Specializations,
		AcceptingClients: profile.IsAcceptingClients,
		CreatedAt:        profile.CreatedAt,
		UpdatedAt:        profile.UpdatedAt,
	}
}

// Therapy Helper Functions
func ToTherapyResponse(therapy *therapyDomain.Therapy) TherapyResponse {
	return TherapyResponse{
		ID:               therapy.ID,
		Title:            therapy.Title,
		ShortDescription: therapy.ShortDescription,
		Icon:             therapy.Icon,
		DetailedInfo:     therapy.DetailedInfo,
		WhenNeeded:       therapy.WhenNeeded,
		IsActive:         therapy.IsActive,
		CreatedAt:        therapy.CreatedAt,
		UpdatedAt:        therapy.UpdatedAt,
	}
}

func ToTherapyListResponse(therapies []*therapyDomain.Therapy) TherapyListResponse {
	responses := make([]TherapyResponse, len(therapies))
	for i, t := range therapies {
		responses[i] = ToTherapyResponse(t)
	}
	return TherapyListResponse{
		Therapies: responses,
	}
}

// Validation functions
func (r *RegisterRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	if r.Password == "" {
		return ErrMissingPassword
	}
	return nil
}

func (r *LoginRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	if r.Password == "" {
		return ErrMissingPassword
	}
	return nil
}

func (r *UpdateProfileRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	return nil
}

func (r *RegisterWithRoleRequest) Validate() error {
	if r.Email == "" {
		return ErrMissingEmail
	}
	if r.Password == "" {
		return ErrMissingPassword
	}
	if r.Role != user.RoleClient && r.Role != user.RoleTherapist {
		return ErrInvalidRole
	}
	return nil
}

// Client Profile Validation Functions
func (r *CreateClientProfileRequest) Validate() error {
	if r.FirstName == "" {
		return ErrMissingFirstName
	}
	if r.LastName == "" {
		return ErrMissingLastName
	}
	return nil
}

func (r *UpdateClientPersonalInfoRequest) Validate() error {
	if r.FirstName == "" {
		return ErrMissingFirstName
	}
	if r.LastName == "" {
		return ErrMissingLastName
	}
	return nil
}

func (r *UpdateClientContactInfoRequest) Validate() error {
	return nil
}

// Therapist Profile Validation Functions
func (r *CreateTherapistProfileRequest) Validate() error {
	if r.FirstName == "" {
		return ErrMissingFirstName
	}
	if r.LastName == "" {
		return ErrMissingLastName
	}
	if r.LicenseNumber == "" {
		return ErrMissingLicenseNumber
	}
	return nil
}

func (r *UpdateTherapistPersonalInfoRequest) Validate() error {
	if r.FirstName == "" {
		return ErrMissingFirstName
	}
	if r.LastName == "" {
		return ErrMissingLastName
	}
	return nil
}

func (r *UpdateTherapistContactInfoRequest) Validate() error {
	if r.Phone == "" {
		return ErrMissingPhone
	}
	return nil
}

func (r *UpdateTherapistBioRequest) Validate() error {
	return nil
}

func (r *UpdateSpecializationsRequest) Validate() error {
	if len(r.Specializations) == 0 {
		return ErrMissingSpecializations
	}
	return nil
}

func (r *AddSpecializationRequest) Validate() error {
	if r.Specialization == "" {
		return ErrMissingSpecialization
	}
	return nil
}

func (r *RemoveSpecializationRequest) Validate() error {
	if r.Specialization == "" {
		return ErrMissingSpecialization
	}
	return nil
}

func (r *UpdateLicenseNumberRequest) Validate() error {
	if r.LicenseNumber == "" {
		return ErrMissingLicenseNumber
	}
	return nil
}

// Therapy Request DTOs
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

// Therapy Response DTOs
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

// Therapy Validation Functions
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
