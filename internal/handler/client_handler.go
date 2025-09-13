package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	clientDomain "github.com/goran/thappy/internal/domain/client"
)

type ClientHandler struct {
	clientService clientDomain.ClientService
}

func NewClientHandler(clientService clientDomain.ClientService) *ClientHandler {
	return &ClientHandler{
		clientService: clientService,
	}
}

func (h *ClientHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req CreateClientProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	createReq := clientDomain.CreateProfileRequest{
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		Phone:            req.Phone,
		EmergencyContact: req.EmergencyContact,
	}

	profile, err := h.clientService.CreateProfile(r.Context(), userID, createReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ClientProfileResponse{
		Profile: ToClientProfileResponse(profile),
		Message: "Client profile created successfully",
	}

	h.writeJSONResponse(w, http.StatusCreated, response)
}

func (h *ClientHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	profile, err := h.clientService.GetProfile(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ClientProfileResponse{
		Profile: ToClientProfileResponse(profile),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ClientHandler) UpdatePersonalInfo(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateClientPersonalInfoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	updateReq := clientDomain.UpdatePersonalInfoRequest{
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	profile, err := h.clientService.UpdatePersonalInfo(r.Context(), userID, updateReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ClientProfileResponse{
		Profile: ToClientProfileResponse(profile),
		Message: "Personal information updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ClientHandler) UpdateContactInfo(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateClientContactInfoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	updateReq := clientDomain.UpdateContactInfoRequest{
		Phone:            req.Phone,
		EmergencyContact: req.EmergencyContact,
	}

	profile, err := h.clientService.UpdateContactInfo(r.Context(), userID, updateReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ClientProfileResponse{
		Profile: ToClientProfileResponse(profile),
		Message: "Contact information updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ClientHandler) SetDateOfBirth(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req SetDateOfBirthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	updateReq := clientDomain.SetDateOfBirthRequest{
		DateOfBirth: req.DateOfBirth,
	}

	profile, err := h.clientService.SetDateOfBirth(r.Context(), userID, updateReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := ClientProfileResponse{
		Profile: ToClientProfileResponse(profile),
		Message: "Date of birth updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *ClientHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	err = h.clientService.DeleteProfile(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := MessageResponse{
		Message: "Client profile deleted successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

// Helper methods

func (h *ClientHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}

func (h *ClientHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	response := ErrorResponse{
		Error: message,
	}
	h.writeJSONResponse(w, status, response)
}

func (h *ClientHandler) handleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, clientDomain.ErrClientProfileNotFound):
		h.writeErrorResponse(w, http.StatusNotFound, "Client profile not found")
	case errors.Is(err, clientDomain.ErrClientProfileAlreadyExists):
		h.writeErrorResponse(w, http.StatusConflict, "Client profile already exists")
	case errors.Is(err, clientDomain.ErrInvalidClientData):
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid client data")
	case errors.Is(err, clientDomain.ErrUnauthorizedAccess):
		h.writeErrorResponse(w, http.StatusForbidden, "Access denied - client role required")
	case errors.Is(err, clientDomain.ErrClientServiceUnavailable):
		h.writeErrorResponse(w, http.StatusServiceUnavailable, "Client service temporarily unavailable")
	default:
		log.Printf("Unhandled client service error: %v", err)
		h.writeErrorResponse(w, http.StatusInternalServerError, "Internal server error")
	}
}

func (h *ClientHandler) getUserIDFromContext(r *http.Request) (string, error) {
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
