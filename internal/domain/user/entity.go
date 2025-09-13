package user

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"strings"
	"time"
)

type UserRole string

const (
	RoleClient    UserRole = "client"
	RoleTherapist UserRole = "therapist"
)

type User struct {
	ID           string
	Email        string
	PasswordHash string
	Role         UserRole
	IsActive     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func NewUser(email, password string) (*User, error) {
	if err := validateEmail(email); err != nil {
		return nil, err
	}

	if err := validatePassword(password); err != nil {
		return nil, err
	}

	hashedPassword, err := hashPassword(password)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &User{
		ID:           generateID(),
		Email:        strings.ToLower(strings.TrimSpace(email)),
		PasswordHash: hashedPassword,
		Role:         RoleClient,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

func (u *User) ValidatePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
	return err == nil
}

func (u *User) UpdateEmail(newEmail string) error {
	if err := validateEmail(newEmail); err != nil {
		return err
	}

	u.Email = strings.ToLower(strings.TrimSpace(newEmail))
	u.UpdatedAt = time.Now()
	return nil
}

func (u *User) UpdatePassword(newPassword string) error {
	if err := validatePassword(newPassword); err != nil {
		return err
	}

	hashedPassword, err := hashPassword(newPassword)
	if err != nil {
		return err
	}

	u.PasswordHash = hashedPassword
	u.UpdatedAt = time.Now()
	return nil
}

func validateEmail(email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return errors.New("email is required")
	}

	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return errors.New("invalid email format")
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return errors.New("invalid email format")
	}

	return nil
}

func validatePassword(password string) error {
	if password == "" {
		return errors.New("password is required")
	}

	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}

	return nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func generateID() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return hex.EncodeToString([]byte(time.Now().String()))
	}
	return hex.EncodeToString(bytes)
}

func NewUserWithRole(email, password string, role UserRole) (*User, error) {
	if err := validateEmail(email); err != nil {
		return nil, err
	}

	if err := validatePassword(password); err != nil {
		return nil, err
	}

	if err := validateRole(role); err != nil {
		return nil, err
	}

	hashedPassword, err := hashPassword(password)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &User{
		ID:           generateID(),
		Email:        strings.ToLower(strings.TrimSpace(email)),
		PasswordHash: hashedPassword,
		Role:         role,
		IsActive:     true,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

func (u *User) HasRole(role UserRole) bool {
	return u.Role == role
}

func (u *User) IsClient() bool {
	return u.Role == RoleClient
}

func (u *User) IsTherapist() bool {
	return u.Role == RoleTherapist
}

func (u *User) SetActive(active bool) {
	u.IsActive = active
	u.UpdatedAt = time.Now()
}

func validateRole(role UserRole) error {
	if role == "" {
		return errors.New("role is required")
	}

	if role != RoleClient && role != RoleTherapist {
		return errors.New("invalid user role")
	}

	return nil
}
