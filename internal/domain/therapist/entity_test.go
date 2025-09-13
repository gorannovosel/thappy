package therapist

import (
	"testing"
	"time"
)

func TestNewTherapistProfile(t *testing.T) {
	tests := []struct {
		name          string
		userID        string
		firstName     string
		lastName      string
		licenseNumber string
		wantErr       bool
		errString     string
	}{
		{
			name:          "valid therapist profile creation",
			userID:        "user-123",
			firstName:     "Dr. Jane",
			lastName:      "Smith",
			licenseNumber: "LIC-12345",
			wantErr:       false,
		},
		{
			name:          "empty user ID",
			userID:        "",
			firstName:     "Dr. Jane",
			lastName:      "Smith",
			licenseNumber: "LIC-12345",
			wantErr:       true,
			errString:     "user ID is required",
		},
		{
			name:          "empty first name",
			userID:        "user-123",
			firstName:     "",
			lastName:      "Smith",
			licenseNumber: "LIC-12345",
			wantErr:       true,
			errString:     "first name is required",
		},
		{
			name:          "empty last name",
			userID:        "user-123",
			firstName:     "Dr. Jane",
			lastName:      "",
			licenseNumber: "LIC-12345",
			wantErr:       true,
			errString:     "last name is required",
		},
		{
			name:          "empty license number",
			userID:        "user-123",
			firstName:     "Dr. Jane",
			lastName:      "Smith",
			licenseNumber: "",
			wantErr:       true,
			errString:     "license number is required",
		},
		{
			name:          "license number too long",
			userID:        "user-123",
			firstName:     "Dr. Jane",
			lastName:      "Smith",
			licenseNumber: "ThisIsAReallyLongLicenseNumberThatExceedsFiftyCharacters",
			wantErr:       true,
			errString:     "license number must be 50 characters or less",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			profile, err := NewTherapistProfile(tt.userID, tt.firstName, tt.lastName, tt.licenseNumber)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewTherapistProfile() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("NewTherapistProfile() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("NewTherapistProfile() unexpected error = %v", err)
				return
			}

			if profile.UserID != tt.userID {
				t.Errorf("NewTherapistProfile() UserID = %v, want %v", profile.UserID, tt.userID)
			}

			if profile.FirstName != tt.firstName {
				t.Errorf("NewTherapistProfile() FirstName = %v, want %v", profile.FirstName, tt.firstName)
			}

			if profile.LastName != tt.lastName {
				t.Errorf("NewTherapistProfile() LastName = %v, want %v", profile.LastName, tt.lastName)
			}

			if profile.LicenseNumber != tt.licenseNumber {
				t.Errorf("NewTherapistProfile() LicenseNumber = %v, want %v", profile.LicenseNumber, tt.licenseNumber)
			}

			if !profile.IsAcceptingClients {
				t.Error("NewTherapistProfile() should set IsAcceptingClients to true by default")
			}

			if profile.CreatedAt.IsZero() {
				t.Error("NewTherapistProfile() CreatedAt should not be zero")
			}

			if profile.UpdatedAt.IsZero() {
				t.Error("NewTherapistProfile() UpdatedAt should not be zero")
			}
		})
	}
}

func TestTherapistProfile_UpdatePersonalInfo(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
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
			firstName: "Dr. John",
			lastName:  "Doe",
			wantErr:   false,
		},
		{
			name:      "empty first name",
			firstName: "",
			lastName:  "Doe",
			wantErr:   true,
			errString: "first name is required",
		},
		{
			name:      "empty last name",
			firstName: "Dr. John",
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

func TestTherapistProfile_UpdateLicenseNumber(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name          string
		licenseNumber string
		wantErr       bool
		errString     string
	}{
		{
			name:          "valid license update",
			licenseNumber: "NEW-LIC-67890",
			wantErr:       false,
		},
		{
			name:          "empty license number",
			licenseNumber: "",
			wantErr:       true,
			errString:     "license number is required",
		},
		{
			name:          "license number too long",
			licenseNumber: "ThisIsAReallyLongLicenseNumberThatExceedsFiftyCharacters",
			wantErr:       true,
			errString:     "license number must be 50 characters or less",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateLicenseNumber(tt.licenseNumber)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateLicenseNumber() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("UpdateLicenseNumber() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateLicenseNumber() unexpected error = %v", err)
				return
			}

			if profile.LicenseNumber != tt.licenseNumber {
				t.Errorf("UpdateLicenseNumber() LicenseNumber = %v, want %v", profile.LicenseNumber, tt.licenseNumber)
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdateLicenseNumber() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestTherapistProfile_UpdateSpecializations(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	specializations := []string{"Anxiety", "Depression", "PTSD"}

	profile.UpdateSpecializations(specializations)

	if len(profile.Specializations) != len(specializations) {
		t.Errorf("UpdateSpecializations() expected %d specializations, got %d", len(specializations), len(profile.Specializations))
	}

	for i, spec := range specializations {
		if profile.Specializations[i] != spec {
			t.Errorf("UpdateSpecializations() specialization[%d] = %v, want %v", i, profile.Specializations[i], spec)
		}
	}

	if !profile.UpdatedAt.After(oldUpdatedAt) {
		t.Error("UpdateSpecializations() should update UpdatedAt timestamp")
	}
}

func TestTherapistProfile_AddSpecialization(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	profile.UpdateSpecializations([]string{"Anxiety", "Depression"})

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name           string
		specialization string
		wantErr        bool
		errString      string
	}{
		{
			name:           "add new specialization",
			specialization: "PTSD",
			wantErr:        false,
		},
		{
			name:           "add duplicate specialization",
			specialization: "Anxiety",
			wantErr:        true,
			errString:      "specialization already exists",
		},
		{
			name:           "empty specialization",
			specialization: "",
			wantErr:        true,
			errString:      "specialization cannot be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			originalCount := len(profile.Specializations)
			err := profile.AddSpecialization(tt.specialization)

			if tt.wantErr {
				if err == nil {
					t.Errorf("AddSpecialization() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("AddSpecialization() error = %v, want %v", err.Error(), tt.errString)
				}
				if len(profile.Specializations) != originalCount {
					t.Error("AddSpecialization() should not modify specializations on error")
				}
				return
			}

			if err != nil {
				t.Errorf("AddSpecialization() unexpected error = %v", err)
				return
			}

			found := false
			for _, spec := range profile.Specializations {
				if spec == tt.specialization {
					found = true
					break
				}
			}

			if !found {
				t.Errorf("AddSpecialization() specialization %v not found in list", tt.specialization)
			}

			if len(profile.Specializations) != originalCount+1 {
				t.Errorf("AddSpecialization() expected %d specializations, got %d", originalCount+1, len(profile.Specializations))
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("AddSpecialization() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestTherapistProfile_RemoveSpecialization(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	profile.UpdateSpecializations([]string{"Anxiety", "Depression", "PTSD"})

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name           string
		specialization string
		wantErr        bool
		errString      string
	}{
		{
			name:           "remove existing specialization",
			specialization: "Depression",
			wantErr:        false,
		},
		{
			name:           "remove non-existent specialization",
			specialization: "NonExistent",
			wantErr:        true,
			errString:      "specialization not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			originalCount := len(profile.Specializations)
			err := profile.RemoveSpecialization(tt.specialization)

			if tt.wantErr {
				if err == nil {
					t.Errorf("RemoveSpecialization() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("RemoveSpecialization() error = %v, want %v", err.Error(), tt.errString)
				}
				if len(profile.Specializations) != originalCount {
					t.Error("RemoveSpecialization() should not modify specializations on error")
				}
				return
			}

			if err != nil {
				t.Errorf("RemoveSpecialization() unexpected error = %v", err)
				return
			}

			for _, spec := range profile.Specializations {
				if spec == tt.specialization {
					t.Errorf("RemoveSpecialization() specialization %v should have been removed", tt.specialization)
				}
			}

			if len(profile.Specializations) != originalCount-1 {
				t.Errorf("RemoveSpecialization() expected %d specializations, got %d", originalCount-1, len(profile.Specializations))
			}

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("RemoveSpecialization() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestTherapistProfile_UpdateContactInfo(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name      string
		phone     string
		wantErr   bool
		errString string
	}{
		{
			name:    "valid phone update",
			phone:   "+1-555-0123",
			wantErr: false,
		},
		{
			name:    "empty phone is valid",
			phone:   "",
			wantErr: false,
		},
		{
			name:      "phone too long",
			phone:     "ThisIsAReallyLongPhoneNumberThatExceedsTwentyCharacters",
			wantErr:   true,
			errString: "phone must be 20 characters or less",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := profile.UpdateContactInfo(tt.phone)

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

			if !profile.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdateContactInfo() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestTherapistProfile_UpdateBio(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	bio := "Experienced therapist with 10+ years in practice specializing in anxiety and depression treatment."

	profile.UpdateBio(bio)

	if profile.Bio != bio {
		t.Errorf("UpdateBio() Bio = %v, want %v", profile.Bio, bio)
	}

	if !profile.UpdatedAt.After(oldUpdatedAt) {
		t.Error("UpdateBio() should update UpdatedAt timestamp")
	}
}

func TestTherapistProfile_SetAcceptingClients(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	oldUpdatedAt := profile.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	profile.SetAcceptingClients(false)

	if profile.IsAcceptingClients {
		t.Error("SetAcceptingClients(false) should set IsAcceptingClients to false")
	}

	if !profile.UpdatedAt.After(oldUpdatedAt) {
		t.Error("SetAcceptingClients() should update UpdatedAt timestamp")
	}

	profile.SetAcceptingClients(true)

	if !profile.IsAcceptingClients {
		t.Error("SetAcceptingClients(true) should set IsAcceptingClients to true")
	}
}

func TestTherapistProfile_GetFullName(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	expectedFullName := "Dr. Jane Smith"
	if fullName := profile.GetFullName(); fullName != expectedFullName {
		t.Errorf("GetFullName() = %v, want %v", fullName, expectedFullName)
	}
}

func TestTherapistProfile_HasSpecialization(t *testing.T) {
	profile, err := NewTherapistProfile("user-123", "Dr. Jane", "Smith", "LIC-12345")
	if err != nil {
		t.Fatalf("Failed to create therapist profile: %v", err)
	}

	profile.UpdateSpecializations([]string{"Anxiety", "Depression", "PTSD"})

	tests := []struct {
		name           string
		specialization string
		want           bool
	}{
		{
			name:           "existing specialization",
			specialization: "Anxiety",
			want:           true,
		},
		{
			name:           "non-existing specialization",
			specialization: "Couples Therapy",
			want:           false,
		},
		{
			name:           "case sensitive check",
			specialization: "anxiety",
			want:           false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := profile.HasSpecialization(tt.specialization); got != tt.want {
				t.Errorf("HasSpecialization() = %v, want %v", got, tt.want)
			}
		})
	}
}
