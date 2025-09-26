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
	ErrMissingSpecializations   = errors.New("specializations are required")
	ErrMissingSpecialization    = errors.New("specialization is required")
	ErrMissingTherapyID         = errors.New("therapy ID is required")
	ErrMissingTitle             = errors.New("therapy title is required")
	ErrMissingShortDescription  = errors.New("therapy short description is required")
	ErrMissingIcon              = errors.New("therapy icon is required")
	ErrMissingDetailedInfo      = errors.New("therapy detailed info is required")
	ErrMissingWhenNeeded        = errors.New("therapy when needed is required")
	ErrNoFieldsToUpdate         = errors.New("at least one field must be provided for update")
)
