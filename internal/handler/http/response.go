package http

import (
	"encoding/json"
	"log"
	"net/http"
)

// ResponseWriter provides utilities for writing HTTP responses
type ResponseWriter struct{}

// NewResponseWriter creates a new ResponseWriter instance
func NewResponseWriter() *ResponseWriter {
	return &ResponseWriter{}
}

// WriteJSON writes a JSON response with the given status code and data
func (rw *ResponseWriter) WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
		// Try to write a simple error response
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// WriteError writes an error response with the given status code and message
func (rw *ResponseWriter) WriteError(w http.ResponseWriter, status int, message string) {
	response := ErrorResponse{
		Error: message,
	}
	rw.WriteJSON(w, status, response)
}

// WriteErrorWithCode writes an error response with error code and details
func (rw *ResponseWriter) WriteErrorWithCode(w http.ResponseWriter, status int, message, code, details string) {
	response := ErrorResponse{
		Error:   message,
		Code:    code,
		Details: details,
	}
	rw.WriteJSON(w, status, response)
}

// WriteSuccess writes a success response with message
func (rw *ResponseWriter) WriteSuccess(w http.ResponseWriter, message string) {
	response := MessageResponse{
		Message: message,
	}
	rw.WriteJSON(w, http.StatusOK, response)
}

// WriteCreated writes a created response (201) with data
func (rw *ResponseWriter) WriteCreated(w http.ResponseWriter, data interface{}) {
	rw.WriteJSON(w, http.StatusCreated, data)
}

// WriteNoContent writes a no content response (204)
func (rw *ResponseWriter) WriteNoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Response DTOs
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type MessageResponse struct {
	Message string `json:"message"`
}
