package handler

import (
	"net/http"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	"github.com/goran/thappy/internal/domain/user"
	httputil "github.com/goran/thappy/internal/handler/http"
)

type Router struct {
	userHandler      *UserHandler
	clientHandler    *ClientHandler
	therapistHandler *TherapistHandler
	authMiddleware   *httputil.AuthMiddleware
}

func NewRouter(
	userService user.UserService,
	clientService clientDomain.ClientService,
	therapistService therapistDomain.TherapistService,
	tokenService user.TokenService,
) *Router {
	return &Router{
		userHandler:      NewUserHandler(userService),
		clientHandler:    NewClientHandler(clientService),
		therapistHandler: NewTherapistHandler(therapistService),
		authMiddleware:   httputil.NewAuthMiddleware(tokenService, userService),
	}
}

func (router *Router) SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", router.healthCheck)

	// Public endpoints (no authentication required)
	mux.Handle("/api/register", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.Register),
		httputil.JSONMiddleware,
	))

	mux.Handle("/api/register-with-role", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.RegisterWithRole),
		httputil.JSONMiddleware,
	))

	mux.Handle("/api/login", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.Login),
		httputil.JSONMiddleware,
	))

	// General user endpoints (authentication required)
	mux.Handle("/api/profile", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.GetProfile),
		router.authMiddleware.RequireAuth,
	))

	mux.Handle("/api/profile/update", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.UpdateProfile),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireAuth,
	))

	// Client-specific endpoints (client role required)
	mux.Handle("/api/client/profile", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.CreateProfile),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireClientRole,
	))

	mux.Handle("/api/client/profile/get", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.GetProfile),
		router.authMiddleware.RequireClientRole,
	))

	mux.Handle("/api/client/profile/personal-info", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.UpdatePersonalInfo),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireClientRole,
	))

	mux.Handle("/api/client/profile/contact-info", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.UpdateContactInfo),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireClientRole,
	))

	mux.Handle("/api/client/profile/date-of-birth", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.SetDateOfBirth),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireClientRole,
	))

	mux.Handle("/api/client/profile/delete", router.applyMiddleware(
		http.HandlerFunc(router.clientHandler.DeleteProfile),
		router.authMiddleware.RequireClientRole,
	))

	// Therapist-specific endpoints (therapist role required)
	mux.Handle("/api/therapist/profile", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.CreateProfile),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/get", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.GetProfile),
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/personal-info", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.UpdatePersonalInfo),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/contact-info", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.UpdateContactInfo),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/bio", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.UpdateBio),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/license", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.UpdateLicenseNumber),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/specializations", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.UpdateSpecializations),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/specialization/add", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.AddSpecialization),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/specialization/remove", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.RemoveSpecialization),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/accepting-clients", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.SetAcceptingClients),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireTherapistRole,
	))

	mux.Handle("/api/therapist/profile/delete", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.DeleteProfile),
		router.authMiddleware.RequireTherapistRole,
	))

	// Public therapist listing endpoints
	mux.Handle("/api/therapists/accepting", router.applyMiddleware(
		http.HandlerFunc(router.therapistHandler.GetAcceptingClients),
		httputil.JSONMiddleware,
	))

	// Apply global middleware
	return router.applyMiddleware(
		mux,
		httputil.CORSMiddleware,
		httputil.LoggingMiddleware,
	)
}

func (router *Router) healthCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"healthy","service":"thappy-api"}`))
}

// applyMiddleware applies middleware functions in reverse order (last middleware wraps first)
func (router *Router) applyMiddleware(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}
