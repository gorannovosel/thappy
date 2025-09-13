package user

import (
	"testing"
	"time"
)

func TestNewUser(t *testing.T) {
	tests := []struct {
		name      string
		email     string
		password  string
		wantErr   bool
		errString string
	}{
		{
			name:     "valid user creation",
			email:    "user@example.com",
			password: "SecurePass123!",
			wantErr:  false,
		},
		{
			name:      "empty email",
			email:     "",
			password:  "SecurePass123!",
			wantErr:   true,
			errString: "email is required",
		},
		{
			name:      "invalid email format",
			email:     "invalid-email",
			password:  "SecurePass123!",
			wantErr:   true,
			errString: "invalid email format",
		},
		{
			name:      "empty password",
			email:     "user@example.com",
			password:  "",
			wantErr:   true,
			errString: "password is required",
		},
		{
			name:      "password too short",
			email:     "user@example.com",
			password:  "short",
			wantErr:   true,
			errString: "password must be at least 8 characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := NewUser(tt.email, tt.password)

			if tt.wantErr {
				if err == nil {
					t.Errorf("NewUser() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("NewUser() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("NewUser() unexpected error = %v", err)
				return
			}

			if user.Email != tt.email {
				t.Errorf("NewUser() email = %v, want %v", user.Email, tt.email)
			}

			if user.ID == "" {
				t.Error("NewUser() ID should not be empty")
			}

			if user.PasswordHash == "" {
				t.Error("NewUser() PasswordHash should not be empty")
			}

			if user.PasswordHash == tt.password {
				t.Error("NewUser() password should be hashed, not stored as plain text")
			}

			if user.CreatedAt.IsZero() {
				t.Error("NewUser() CreatedAt should not be zero")
			}

			if user.UpdatedAt.IsZero() {
				t.Error("NewUser() UpdatedAt should not be zero")
			}
		})
	}
}

func TestUser_ValidatePassword(t *testing.T) {
	user, err := NewUser("user@example.com", "SecurePass123!")
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			password: "SecurePass123!",
			want:     true,
		},
		{
			name:     "incorrect password",
			password: "WrongPassword",
			want:     false,
		},
		{
			name:     "empty password",
			password: "",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := user.ValidatePassword(tt.password); got != tt.want {
				t.Errorf("ValidatePassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUser_UpdateEmail(t *testing.T) {
	user, err := NewUser("old@example.com", "SecurePass123!")
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	oldUpdatedAt := user.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name      string
		newEmail  string
		wantErr   bool
		errString string
	}{
		{
			name:     "valid email update",
			newEmail: "new@example.com",
			wantErr:  false,
		},
		{
			name:      "invalid email format",
			newEmail:  "invalid-email",
			wantErr:   true,
			errString: "invalid email format",
		},
		{
			name:      "empty email",
			newEmail:  "",
			wantErr:   true,
			errString: "email is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.UpdateEmail(tt.newEmail)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdateEmail() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("UpdateEmail() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdateEmail() unexpected error = %v", err)
				return
			}

			if user.Email != tt.newEmail {
				t.Errorf("UpdateEmail() email = %v, want %v", user.Email, tt.newEmail)
			}

			if !user.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdateEmail() should update UpdatedAt timestamp")
			}
		})
	}
}

func TestUser_UpdatePassword(t *testing.T) {
	user, err := NewUser("user@example.com", "OldPassword123!")
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	oldPasswordHash := user.PasswordHash
	oldUpdatedAt := user.UpdatedAt
	time.Sleep(10 * time.Millisecond)

	tests := []struct {
		name        string
		newPassword string
		wantErr     bool
		errString   string
	}{
		{
			name:        "valid password update",
			newPassword: "NewPassword456!",
			wantErr:     false,
		},
		{
			name:        "password too short",
			newPassword: "short",
			wantErr:     true,
			errString:   "password must be at least 8 characters",
		},
		{
			name:        "empty password",
			newPassword: "",
			wantErr:     true,
			errString:   "password is required",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.UpdatePassword(tt.newPassword)

			if tt.wantErr {
				if err == nil {
					t.Errorf("UpdatePassword() expected error but got none")
					return
				}
				if err.Error() != tt.errString {
					t.Errorf("UpdatePassword() error = %v, want %v", err.Error(), tt.errString)
				}
				return
			}

			if err != nil {
				t.Errorf("UpdatePassword() unexpected error = %v", err)
				return
			}

			if user.PasswordHash == oldPasswordHash {
				t.Error("UpdatePassword() should change password hash")
			}

			if !user.ValidatePassword(tt.newPassword) {
				t.Error("UpdatePassword() new password validation failed")
			}

			if !user.UpdatedAt.After(oldUpdatedAt) {
				t.Error("UpdatePassword() should update UpdatedAt timestamp")
			}
		})
	}
}
