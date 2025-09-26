package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
)

type TherapistHandler struct {
	therapistService therapistDomain.TherapistService
}

func NewTherapistHandler(therapistService therapistDomain.TherapistService) *TherapistHandler {
	return &TherapistHandler{
		therapistService: therapistService,
	}
}

func (h *TherapistHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req CreateTherapistProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	createReq := therapistDomain.CreateProfileRequest{
		FirstName:     req.FirstName,
		LastName:      req.LastName,
		LicenseNumber: req.LicenseNumber,
		Phone:         req.Phone,
		Bio:           req.Bio,
	}

	profile, err := h.therapistService.CreateProfile(r.Context(), userID, createReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Therapist profile created successfully",
	}

	h.writeJSONResponse(w, http.StatusCreated, response)
}

func (h *TherapistHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	profile, err := h.therapistService.GetProfile(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) UpdatePersonalInfo(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateTherapistPersonalInfoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	updateReq := therapistDomain.UpdatePersonalInfoRequest{
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	profile, err := h.therapistService.UpdatePersonalInfo(r.Context(), userID, updateReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Personal information updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) UpdateContactInfo(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateTherapistContactInfoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	updateReq := therapistDomain.UpdateContactInfoRequest{
		Phone: req.Phone,
	}

	profile, err := h.therapistService.UpdateContactInfo(r.Context(), userID, updateReq)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Contact information updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) UpdateBio(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateTherapistBioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	profile, err := h.therapistService.UpdateBio(r.Context(), userID, req.Bio)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Bio updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) UpdateLicenseNumber(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateLicenseNumberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.therapistService.UpdateLicenseNumber(r.Context(), userID, req.LicenseNumber)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "License number updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) UpdateSpecializations(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req UpdateSpecializationsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.therapistService.UpdateSpecializations(r.Context(), userID, req.Specializations)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Specializations updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) AddSpecialization(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req AddSpecializationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.therapistService.AddSpecialization(r.Context(), userID, req.Specialization)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Specialization added successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) RemoveSpecialization(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req RemoveSpecializationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.therapistService.RemoveSpecialization(r.Context(), userID, req.Specialization)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Specialization removed successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) SetAcceptingClients(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	var req SetAcceptingClientsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	profile, err := h.therapistService.SetAcceptingClients(r.Context(), userID, req.AcceptingClients)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
		Message: "Accepting clients status updated successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) GetAcceptingClients(w http.ResponseWriter, r *http.Request) {
	profiles, err := h.therapistService.GetAcceptingClients(r.Context())
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	var profilesData []TherapistProfileData
	for _, profile := range profiles {
		profilesData = append(profilesData, ToTherapistProfileResponse(profile))
	}

	response := struct {
		Therapists []TherapistProfileData `json:"therapists"`
		Message    string                 `json:"message,omitempty"`
	}{
		Therapists: profilesData,
		Message:    "Available therapists retrieved successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) SearchTherapists(w http.ResponseWriter, r *http.Request) {
	var req SearchTherapistsRequest
	if err := req.FromQueryParams(r.URL.Query()); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	filters := req.ToTherapistSearchFilters()
	profiles, err := h.therapistService.SearchTherapists(r.Context(), filters)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	var profilesData []TherapistProfileData
	for _, profile := range profiles {
		profilesData = append(profilesData, ToTherapistProfileResponse(profile))
	}

	response := struct {
		Therapists []TherapistProfileData `json:"therapists"`
		Total      int                    `json:"total"`
		Message    string                 `json:"message,omitempty"`
	}{
		Therapists: profilesData,
		Total:      len(profilesData),
		Message:    "Therapists search completed successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) GetTherapistByID(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL path
	path := r.URL.Path
	id := path[strings.LastIndex(path, "/")+1:]

	if id == "" {
		h.writeErrorResponse(w, http.StatusBadRequest, "Therapist ID is required")
		return
	}

	profile, err := h.therapistService.GetProfile(r.Context(), id)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) GetTherapistByLicenseNumber(w http.ResponseWriter, r *http.Request) {
	// Extract license number from URL path
	path := r.URL.Path
	licenseNumber := path[strings.LastIndex(path, "/")+1:]

	if licenseNumber == "" {
		h.writeErrorResponse(w, http.StatusBadRequest, "License number is required")
		return
	}

	profile, err := h.therapistService.GetByLicenseNumber(r.Context(), licenseNumber)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := TherapistProfileResponse{
		Profile: ToTherapistProfileResponse(profile),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapistHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserIDFromContext(r)
	if err != nil {
		h.writeErrorResponse(w, http.StatusUnauthorized, ErrUnauthorized.Error())
		return
	}

	err = h.therapistService.DeleteProfile(r.Context(), userID)
	if err != nil {
		h.handleServiceError(w, err)
		return
	}

	response := MessageResponse{
		Message: "Therapist profile deleted successfully",
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

// Helper methods

func (h *TherapistHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}

func (h *TherapistHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	response := ErrorResponse{
		Error: message,
	}
	h.writeJSONResponse(w, status, response)
}

func (h *TherapistHandler) handleServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, therapistDomain.ErrTherapistProfileNotFound):
		h.writeErrorResponse(w, http.StatusNotFound, "Therapist profile not found")
	case errors.Is(err, therapistDomain.ErrTherapistProfileAlreadyExists):
		h.writeErrorResponse(w, http.StatusConflict, "Therapist profile already exists")
	case errors.Is(err, therapistDomain.ErrInvalidTherapistData):
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid therapist data")
	case errors.Is(err, therapistDomain.ErrUnauthorizedAccess):
		h.writeErrorResponse(w, http.StatusForbidden, "Access denied - therapist role required")
	case errors.Is(err, therapistDomain.ErrTherapistServiceUnavailable):
		h.writeErrorResponse(w, http.StatusServiceUnavailable, "Therapist service temporarily unavailable")
	case errors.Is(err, therapistDomain.ErrLicenseNumberAlreadyExists):
		h.writeErrorResponse(w, http.StatusConflict, "License number already in use")
	default:
		log.Printf("Unhandled therapist service error: %v", err)
		h.writeErrorResponse(w, http.StatusInternalServerError, "Internal server error")
	}
}

func (h *TherapistHandler) getUserIDFromContext(r *http.Request) (string, error) {
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
