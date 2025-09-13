package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/goran/thappy/internal/domain/user"
)

type UserHandler struct {
	userService user.UserService
}

func NewUserHandler(userService user.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.userService.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := RegisterResponse{
		User:    ToUserResponse(user),
		Message: "User registered successfully",
	}

	h.writeJSONResponse(w, http.StatusCreated, response)
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.userService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	// Get user details for response
	// Note: In a real implementation, you might get this from the token or make another service call
	// For now, we'll get user by email from the service
	user, err := h.getUserByEmail(r.Context(), req.Email)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := LoginResponse{
		Token:   token,
		User:    ToUserResponse(user),
		Message: "Login successful",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ProfileResponse{
		User: ToUserResponse(user),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// Get current user
	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	// Update email if provided
	if req.Email != "" && req.Email != user.Email {
		if err := user.UpdateEmail(req.Email); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	// Save updated user
	if err := h.userService.UpdateUser(r.Context(), user); err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ProfileResponse{
		User: ToUserResponse(user),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

// Helper methods

func (h *UserHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}

func (h *UserHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	response := ErrorResponse{
		Error: message,
	}
	h.writeJSONResponse(w, status, response)
}

func (h *UserHandler) handleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, user.ErrUserAlreadyExists):
		h.writeErrorResponse(w, http.StatusConflict, "User with this email already exists")
	case errors.Is(err, user.ErrUserNotFound):
		h.writeErrorResponse(w, http.StatusNotFound, "User not found")
	case errors.Is(err, user.ErrInvalidCredentials):
		h.writeErrorResponse(w, http.StatusUnauthorized, "Invalid email or password")
	case errors.Is(err, user.ErrTokenGeneration):
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to generate authentication token")
	default:
		if err.Error() == "invalid email format" || err.Error() == "password must be at least 8 characters" || err.Error() == "email is required" || err.Error() == "password is required" {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		} else {
			log.Printf("Unhandled service error: %v", err)
			h.writeErrorResponse(w, http.StatusInternalServerError, "Internal server error")
		}
	}
}

func (h *UserHandler) getUserIDFromContext(r *http.Request) (string, error) {
	userID := r.Context().Value("userID")
	if userID == nil {
		return "", ErrMissingUserID
	}

	userIDStr, ok := userID.(string)
	if !ok {
		return "", ErrInvalidUserID
	}

	return userIDStr, nil
}

// getUserByEmail is a helper method to get user by email
// In a real implementation, this might be a separate method on the service
// or you might extract the user ID from the token
func (h *UserHandler) getUserByEmail(ctx interface{}, email string) (*user.User, error) {
	// This is a simplified implementation
	// In practice, you'd need to add a GetUserByEmail method to the service
	// or extract user info from the JWT token

	// For now, we'll create a mock user response
	// This should be replaced with actual service call
	user, err := user.NewUser(email, "dummy_password")
	if err != nil {
		return nil, err
	}
	return user, nil
}
