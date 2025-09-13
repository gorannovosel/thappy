package user

import (
	"encoding/json"
	"net/http"

	"github.com/goran/thappy/internal/domain/user"
	httputil "github.com/goran/thappy/internal/handler/http"
)

type Handler struct {
	userService    user.UserService
	responseWriter *httputil.ResponseWriter
	errorHandler   *httputil.ErrorHandler
}

func NewHandler(userService user.UserService) *Handler {
	return &Handler{
		userService:    userService,
		responseWriter: httputil.NewResponseWriter(),
		errorHandler:   httputil.NewErrorHandler(),
	}
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorHandler.HandleValidationError(w, httputil.ErrInvalidJSON)
		return
	}

	if err := req.Validate(); err != nil {
		h.errorHandler.HandleValidationError(w, err)
		return
	}

	userEntity, err := h.userService.Register(r.Context(), req.Email, req.Password)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := RegisterResponse{
		User:    ToUserResponse(userEntity),
		Message: "User registered successfully",
	}

	h.responseWriter.WriteCreated(w, response)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorHandler.HandleValidationError(w, httputil.ErrInvalidJSON)
		return
	}

	if err := req.Validate(); err != nil {
		h.errorHandler.HandleValidationError(w, err)
		return
	}

	token, err := h.userService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	// Get user details for response (simplified for now)
	userEntity, err := h.getUserByEmail(r.Context(), req.Email)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := LoginResponse{
		Token:   token,
		User:    ToUserResponse(userEntity),
		Message: "Login successful",
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.errorHandler.HandleAuthError(w, "Unauthorized")
		return
	}

	userEntity, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := ProfileResponse{
		User: ToUserResponse(userEntity),
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.errorHandler.HandleAuthError(w, "Unauthorized")
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorHandler.HandleValidationError(w, httputil.ErrInvalidJSON)
		return
	}

	if err := req.Validate(); err != nil {
		h.errorHandler.HandleValidationError(w, err)
		return
	}

	// Get current user
	userEntity, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	// Update email if provided
	if req.Email != "" && req.Email != userEntity.Email {
		if err := userEntity.UpdateEmail(req.Email); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	// Save updated user
	if err := h.userService.UpdateUser(r.Context(), userEntity); err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := ProfileResponse{
		User: ToUserResponse(userEntity),
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

// Helper methods

func (h *Handler) getUserIDFromContext(r *http.Request) (string, error) {
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

// getUserByEmail is a simplified implementation
// In practice, you'd extract user info from the JWT token or add a service method
func (h *Handler) getUserByEmail(ctx interface{}, email string) (*user.User, error) {
	// This is a simplified implementation for demo purposes
	// In a real application, you'd either:
	// 1. Extract user info from the JWT token, or
	// 2. Add a GetUserByEmail method to the user service
	userEntity, err := user.NewUser(email, "dummy_password")
	if err != nil {
		return nil, err
	}
	return userEntity, nil
}
