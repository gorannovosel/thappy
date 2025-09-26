package therapy

import "errors"

var (
	ErrMissingTherapyID        = errors.New("therapy ID is required")
	ErrMissingTitle            = errors.New("therapy title is required")
	ErrMissingShortDescription = errors.New("therapy short description is required")
	ErrMissingIcon             = errors.New("therapy icon is required")
	ErrMissingDetailedInfo     = errors.New("therapy detailed info is required")
	ErrMissingWhenNeeded       = errors.New("therapy when needed is required")
	ErrNoFieldsToUpdate        = errors.New("at least one field must be provided for update")
)
