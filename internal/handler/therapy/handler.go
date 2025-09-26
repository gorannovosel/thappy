package therapy

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/goran/thappy/internal/domain/therapy"
	httputil "github.com/goran/thappy/internal/handler/http"
)

type Handler struct {
	therapyService therapy.Service
	responseWriter *httputil.ResponseWriter
	errorHandler   *httputil.ErrorHandler
}

func NewHandler(therapyService therapy.Service) *Handler {
	return &Handler{
		therapyService: therapyService,
		responseWriter: httputil.NewResponseWriter(),
		errorHandler:   httputil.NewErrorHandler(),
	}
}

func (h *Handler) CreateTherapy(w http.ResponseWriter, r *http.Request) {
	var req CreateTherapyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorHandler.HandleValidationError(w, httputil.ErrInvalidJSON)
		return
	}

	if err := req.Validate(); err != nil {
		h.errorHandler.HandleValidationError(w, err)
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
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := CreateTherapyResponse{
		Therapy: ToTherapyResponse(therapyEntity),
		Message: "Therapy created successfully",
	}

	h.responseWriter.WriteCreated(w, response)
}

func (h *Handler) GetTherapy(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	therapyID := vars["id"]

	if therapyID == "" {
		h.errorHandler.HandleValidationError(w, ErrMissingTherapyID)
		return
	}

	therapyEntity, err := h.therapyService.GetTherapy(r.Context(), therapyID)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := TherapyDetailResponse{
		Therapy: ToTherapyResponse(therapyEntity),
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) ListTherapies(w http.ResponseWriter, r *http.Request) {
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
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := ToTherapyListResponse(therapies)
	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) UpdateTherapy(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	therapyID := vars["id"]

	if therapyID == "" {
		h.errorHandler.HandleValidationError(w, ErrMissingTherapyID)
		return
	}

	var req UpdateTherapyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorHandler.HandleValidationError(w, httputil.ErrInvalidJSON)
		return
	}

	if err := req.Validate(); err != nil {
		h.errorHandler.HandleValidationError(w, err)
		return
	}

	// Get existing therapy
	therapyEntity, err := h.therapyService.GetTherapy(r.Context(), therapyID)
	if err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	// Update fields if provided
	if req.Title != "" {
		if err := therapyEntity.UpdateTitle(req.Title); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	if req.ShortDescription != "" {
		if err := therapyEntity.UpdateShortDescription(req.ShortDescription); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	if req.Icon != "" {
		if err := therapyEntity.UpdateIcon(req.Icon); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	if req.DetailedInfo != "" {
		if err := therapyEntity.UpdateDetailedInfo(req.DetailedInfo); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	if req.WhenNeeded != "" {
		if err := therapyEntity.UpdateWhenNeeded(req.WhenNeeded); err != nil {
			h.errorHandler.HandleValidationError(w, err)
			return
		}
	}

	// Save updated therapy
	if err := h.therapyService.UpdateTherapy(r.Context(), therapyEntity); err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	response := TherapyDetailResponse{
		Therapy: ToTherapyResponse(therapyEntity),
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, response)
}

func (h *Handler) DeleteTherapy(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	therapyID := vars["id"]

	if therapyID == "" {
		h.errorHandler.HandleValidationError(w, ErrMissingTherapyID)
		return
	}

	if err := h.therapyService.DeleteTherapy(r.Context(), therapyID); err != nil {
		h.errorHandler.HandleServiceError(w, err)
		return
	}

	h.responseWriter.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Therapy deleted successfully",
	})
}