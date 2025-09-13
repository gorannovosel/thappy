package handler

import "errors"

var (
	ErrMissingEmail           = errors.New("email is required")
	ErrMissingPassword        = errors.New("password is required")
	ErrInvalidJSON            = errors.New("invalid JSON format")
	ErrMissingUserID          = errors.New("user ID not found in context")
	ErrInvalidUserID          = errors.New("invalid user ID format")
	ErrUnauthorized           = errors.New("unauthorized")
	ErrInternalServer         = errors.New("internal server error")
	ErrInvalidRole            = errors.New("invalid role - must be 'client' or 'therapist'")
	ErrMissingFirstName       = errors.New("first name is required")
	ErrMissingLastName        = errors.New("last name is required")
	ErrMissingPhone           = errors.New("phone number is required")
	ErrMissingLicenseNumber   = errors.New("license number is required")
	ErrMissingSpecializations = errors.New("specializations are required")
	ErrMissingSpecialization  = errors.New("specialization is required")
)
