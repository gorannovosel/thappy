package handler

import (
	"net/http"

	"github.com/goran/thappy/internal/domain/user"
	httputil "github.com/goran/thappy/internal/handler/http"
)

type Router struct {
	userHandler    *UserHandler
	authMiddleware *httputil.AuthMiddleware
}

func NewRouter(userService user.UserService, tokenService user.TokenService) *Router {
	return &Router{
		userHandler:    NewUserHandler(userService),
		authMiddleware: httputil.NewAuthMiddleware(tokenService, userService),
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

	mux.Handle("/api/login", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.Login),
		httputil.JSONMiddleware,
	))

	// Protected endpoints (authentication required)
	mux.Handle("/api/profile", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.GetProfile),
		router.authMiddleware.RequireAuth,
	))

	mux.Handle("/api/profile/update", router.applyMiddleware(
		http.HandlerFunc(router.userHandler.UpdateProfile),
		httputil.JSONMiddleware,
		router.authMiddleware.RequireAuth,
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
