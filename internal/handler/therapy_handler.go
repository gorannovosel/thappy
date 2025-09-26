package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/goran/thappy/internal/domain/therapy"
)

type TherapyHandler struct {
	therapyService therapy.Service
}

func NewTherapyHandler(therapyService therapy.Service) *TherapyHandler {
	return &TherapyHandler{
		therapyService: therapyService,
	}
}

func (h *TherapyHandler) CreateTherapy(w http.ResponseWriter, r *http.Request) {
	var req CreateTherapyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	therapyEntity, err := h.therapyService.CreateTherapy(
		r.Context(),
		req.ID,
		req.Title,
		req.ShortDescription,
		req.Icon,
		req.DetailedInfo,
		req.WhenNeeded,
	)
	if err != nil {
		if err == therapy.ErrTherapyAlreadyExists {
			h.writeErrorResponse(w, http.StatusConflict, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to create therapy")
		return
	}

	response := CreateTherapyResponse{
		Therapy: ToTherapyResponse(therapyEntity),
		Message: "Therapy created successfully",
	}

	h.writeJSONResponse(w, http.StatusCreated, response)
}

func (h *TherapyHandler) HandleTherapies(w http.ResponseWriter, r *http.Request) {
	// Parse the URL path to determine the action
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	// Handle based on method and path structure
	switch r.Method {
	case http.MethodGet:
		if len(pathParts) == 2 { // /api/therapies
			h.listTherapies(w, r)
		} else if len(pathParts) == 3 && pathParts[2] != "" { // /api/therapies/{id}
			h.getTherapy(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodPost:
		if len(pathParts) == 2 { // /api/therapies
			h.CreateTherapy(w, r)
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodPut:
		if len(pathParts) == 3 && pathParts[2] != "" { // /api/therapies/{id}
			h.updateTherapy(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	case http.MethodDelete:
		if len(pathParts) == 3 && pathParts[2] != "" { // /api/therapies/{id}
			h.deleteTherapy(w, r, pathParts[2])
		} else {
			h.writeErrorResponse(w, http.StatusBadRequest, "Invalid URL path")
		}
	default:
		h.writeErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (h *TherapyHandler) getTherapy(w http.ResponseWriter, r *http.Request, therapyID string) {
	therapyEntity, err := h.therapyService.GetTherapy(r.Context(), therapyID)
	if err != nil {
		if err == therapy.ErrTherapyNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get therapy")
		return
	}

	response := TherapyDetailResponse{
		Therapy: ToTherapyResponse(therapyEntity),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapyHandler) listTherapies(w http.ResponseWriter, r *http.Request) {
	// Check if we should filter by active status
	activeOnly := r.URL.Query().Get("active") == "true"

	var therapies []*therapy.Therapy
	var err error

	if activeOnly {
		therapies, err = h.therapyService.ListActiveTherapies(r.Context())
	} else {
		therapies, err = h.therapyService.ListTherapies(r.Context())
	}

	if err != nil {
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get therapies")
		return
	}

	response := ToTherapyListResponse(therapies)
	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapyHandler) updateTherapy(w http.ResponseWriter, r *http.Request, therapyID string) {

	var req UpdateTherapyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, ErrInvalidJSON.Error())
		return
	}

	if err := req.Validate(); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// Get existing therapy
	therapyEntity, err := h.therapyService.GetTherapy(r.Context(), therapyID)
	if err != nil {
		if err == therapy.ErrTherapyNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get therapy")
		return
	}

	// Update fields if provided
	if req.Title != "" {
		if err := therapyEntity.UpdateTitle(req.Title); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.ShortDescription != "" {
		if err := therapyEntity.UpdateShortDescription(req.ShortDescription); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.Icon != "" {
		if err := therapyEntity.UpdateIcon(req.Icon); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.DetailedInfo != "" {
		if err := therapyEntity.UpdateDetailedInfo(req.DetailedInfo); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if req.WhenNeeded != "" {
		if err := therapyEntity.UpdateWhenNeeded(req.WhenNeeded); err != nil {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	// Save updated therapy
	if err := h.therapyService.UpdateTherapy(r.Context(), therapyEntity); err != nil {
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to update therapy")
		return
	}

	response := TherapyDetailResponse{
		Therapy: ToTherapyResponse(therapyEntity),
	}

	h.writeJSONResponse(w, http.StatusOK, response)
}

func (h *TherapyHandler) deleteTherapy(w http.ResponseWriter, r *http.Request, therapyID string) {

	if err := h.therapyService.DeleteTherapy(r.Context(), therapyID); err != nil {
		if err == therapy.ErrTherapyNotFound {
			h.writeErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete therapy")
		return
	}

	h.writeJSONResponse(w, http.StatusOK, map[string]string{
		"message": "Therapy deleted successfully",
	})
}

// Helper functions
func (h *TherapyHandler) writeJSONResponse(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func (h *TherapyHandler) writeErrorResponse(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	response := map[string]string{"error": message}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode error response", http.StatusInternalServerError)
	}
}
