package client

import (
	"testing"
	"time"
)

func TestNewClientProfile(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		firstName string
		lastName  string
		wantErr   bool
		errString string
	}{
		{
			name:      "valid client profile creation",
			userID:    "user-123",
			firstName: "John",
			lastName:  "Doe",
			wantErr:   false,
		},
		{
			name:      "empty user ID",
			userID:    "",
			firstName: "John",
			lastName:  "Doe",
			wantErr:   true,
			errString: "user ID is required",
		},
		{
			name:      "empty first name",
			userID:    "user-123",
			firstName: "",
			lastName:  "Doe",
			wantErr:   true,
			errString: "first name is required",
		},
		{
			name:      "empty last name",
			userID:    "user-123",
			firstName: "John",
			lastName:  "",
			wantErr:   true,
			errString: "last name is required",
		},
		{
			name:      "first name too long",
			userID:    "user-123",
			firstName: "ThisIsAReallyLongFirstNameThatExceedsOneHundredCharactersWhichShouldCauseAValidationErrorBecauseItIsWayTooLongToBeAccepted",
			lastName:  "Doe",
			wantErr:   true,
			errString: "first name must be 100 characters or less",
		},
		{
			name:      "last name too long",
			userID:    "user-123",
			firstName: "John",
			lastName:  "ThisIsAReallyLongLastNameThatExceedsOneHundredCharactersWhichShouldCauseAValidationErrorBecauseItIsWayTooLongToBeAccepted",
			wantErr:   true,
			errString: "last name must be 100 characters or less",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile, err := NewClientProfile(tt.userID, tt.firstName, tt.lastName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewClientProfile() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("NewClientProfile() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("NewClientProfile() unexpected error = %v", err)
				return
			}

			if profile.UserID != tt.userID {
				t.Errorf("NewClientProfile() UserID = %v, want %v", profile.UserID, tt.userID)
			}

			if profile.FirstName != tt.firstName {
				t.Errorf("NewClientProfile() FirstName = %v, want %v", profile.FirstName, tt.firstName)
			}

			if profile.LastName != tt.lastName {
				t.Errorf("NewClientProfile() LastName = %v, want %v", profile.LastName, tt.lastName)
			}

			if profile.CreatedAt.IsZero() {
				t.Error("NewClientProfile() CreatedAt should not be zero")
			}

			if profile.UpdatedAt.IsZero() {
				t.Error("NewClientProfile() UpdatedAt should not be zero")
			}
		})
	}
}

func TestClientProfile_UpdatePersonalInfo(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name      string
		firstName string
		lastName  string
		wantErr   bool
		errString string
	}{
		{
			name:      "valid update",
			firstName: "Jane",
			lastName:  "Smith",
			wantErr:   false,
		},
		{
			name:      "empty first name",
			firstName: "",
			lastName:  "Smith",
			wantErr:   true,
			errString: "first name is required",
		},
		{
			name:      "empty last name",
			firstName: "Jane",
			lastName:  "",
			wantErr:   true,
			errString: "last name is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdatePersonalInfo(tt.firstName, tt.lastName)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdatePersonalInfo() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("UpdatePersonalInfo() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdatePersonalInfo() unexpected error = %v", err)
				return
			}

			if profile.FirstName != tt.firstName {
				t.Errorf("UpdatePersonalInfo() FirstName = %v, want %v", profile.FirstName, tt.firstName)
			}

			if profile.LastName != tt.lastName {
				t.Errorf("UpdatePersonalInfo() LastName = %v, want %v", profile.LastName, tt.lastName)
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdatePersonalInfo() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestClientProfile_UpdateContactInfo(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name             string
		phone            string
		emergencyContact string
		wantErr          bool
		errString        string
	}{
		{
			name:             "valid contact update",
			phone:            "+1-555-0123",
			emergencyContact: "Jane Doe - Sister - +1-555-9876",
			wantErr:          false,
		},
		{
			name:             "empty phone is valid",
			phone:            "",
			emergencyContact: "Jane Doe - Sister - +1-555-9876",
			wantErr:          false,
		},
		{
			name:             "phone too long",
			phone:            "ThisIsAReallyLongPhoneNumberThatExceedsTwentyCharacters",
			emergencyContact: "Jane Doe",
			wantErr:          true,
			errString:        "phone must be 20 characters or less",
		},
		{
			name:             "emergency contact too long",
			phone:            "+1-555-0123",
			emergencyContact: "This is a really long emergency contact description that exceeds two hundred fifty five characters which should cause a validation error because we want to limit the length of this field to ensure database storage works correctly and efficiently for our application needs",
			wantErr:          true,
			errString:        "emergency contact must be 255 characters or less",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateContactInfo(tt.phone, tt.emergencyContact)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateContactInfo() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("UpdateContactInfo() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateContactInfo() unexpected error = %v", err)
				return
			}

			if profile.Phone != tt.phone {
				t.Errorf("UpdateContactInfo() Phone = %v, want %v", profile.Phone, tt.phone)
			}

			if profile.EmergencyContact != tt.emergencyContact {
				t.Errorf("UpdateContactInfo() EmergencyContact = %v, want %v", profile.EmergencyContact, tt.emergencyContact)
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdateContactInfo() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestClientProfile_SetDateOfBirth(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	birthDate := time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC)
	futureDate := time.Now().Add(24 * time.Hour)

	tests := []struct {
		name      string
		birthDate *time.Time
		wantErr   bool
		errString string
	}{
		{
			name:      "valid birth date",
			birthDate: &birthDate,
			wantErr:   false,
		},
		{
			name:      "nil birth date is valid",
			birthDate: nil,
			wantErr:   false,
		},
		{
			name:      "future birth date",
			birthDate: &futureDate,
			wantErr:   true,
			errString: "birth date cannot be in the future",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.SetDateOfBirth(tt.birthDate)

			if tt.wantErr {
				if err == nil {
					t.Errorf("SetDateOfBirth() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("SetDateOfBirth() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("SetDateOfBirth() unexpected error = %v", err)
				return
			}

			if tt.birthDate == nil && profile.DateOfBirth != nil {
				t.Error("SetDateOfBirth(nil) should set DateOfBirth to nil")
			}

			if tt.birthDate != nil && profile.DateOfBirth == nil {
				t.Error("SetDateOfBirth() should set DateOfBirth")
			}

			if tt.birthDate != nil && profile.DateOfBirth != nil && !profile.DateOfBirth.Equal(*tt.birthDate) {
				t.Errorf("SetDateOfBirth() DateOfBirth = %v, want %v", profile.DateOfBirth, *tt.birthDate)
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("SetDateOfBirth() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestClientProfile_AssignTherapist(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	therapistID := "therapist-456"

	tests := []struct {
		name        string
		therapistID *string
		wantErr     bool
		errString   string
	}{
		{
			name:        "valid therapist assignment",
			therapistID: &therapistID,
			wantErr:     false,
		},
		{
			name:        "unassign therapist",
			therapistID: nil,
			wantErr:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile.AssignTherapist(tt.therapistID)

			if tt.therapistID == nil && profile.TherapistID != nil {
				t.Error("AssignTherapist(nil) should unassign therapist")
			}

			if tt.therapistID != nil && profile.TherapistID == nil {
				t.Error("AssignTherapist() should assign therapist")
			}

			if tt.therapistID != nil && profile.TherapistID != nil && *profile.TherapistID != *tt.therapistID {
				t.Errorf("AssignTherapist() TherapistID = %v, want %v", *profile.TherapistID, *tt.therapistID)
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("AssignTherapist() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestClientProfile_UpdateNotes(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	notes := "Initial assessment completed. Client shows good engagement."

	profile.UpdateNotes(notes)

	if profile.Notes != notes {
		t.Errorf("UpdateNotes() Notes = %v, want %v", profile.Notes, notes)
	}

	if !profile.UpdatedAt.After(oldUpdatedAt) {
		t.Error("UpdateNotes() should update UpdatedAt timestamp")
	}
}

func TestClientProfile_GetFullName(t *testing.T) {
	profile, err := NewClientProfile("user-123", "John", "Doe")
	if err != nil {
		t.Fatalf("Failed to create client profile: %v", err)
	}

	expectedFullName := "John Doe"
	if fullName := profile.GetFullName(); fullName != expectedFullName {
		t.Errorf("GetFullName() = %v, want %v", fullName, expectedFullName)
	}
}
