package handler

import (
	"net/http"

	articleDomain "github.com/goran/thappy/internal/domain/article"
	clientDomain "github.com/goran/thappy/internal/domain/client"
	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	therapyDomain "github.com/goran/thappy/internal/domain/therapy"
	"github.com/goran/thappy/internal/domain/user"
)

type Router struct {
	userHandler      *UserHandler
	clientHandler    *ClientHandler
	therapistHandler *TherapistHandler
	therapyHandler   *TherapyHandler
	articleHandler   *ArticleHandler
}

func NewRouter(
	userService user.UserService,
	clientService clientDomain.ClientService,
	therapistService therapistDomain.TherapistService,
	therapyService therapyDomain.Service,
	articleService articleDomain.Service,
	tokenService user.TokenService,
) *Router {
	return &Router{
		userHandler:      NewUserHandler(userService),
		clientHandler:    NewClientHandler(clientService),
		therapistHandler: NewTherapistHandler(therapistService),
		therapyHandler:   NewTherapyHandler(therapyService),
		articleHandler:   NewArticleHandler(articleService),
	}
}

func (router *Router) SetupRoutes() http.Handler {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", router.healthCheck)

	// Public endpoints (no authentication required)
	mux.HandleFunc("/api/register", router.userHandler.Register)
	mux.HandleFunc("/api/register-with-role", router.userHandler.RegisterWithRole)
	mux.HandleFunc("/api/login", router.userHandler.Login)

	// Public therapy endpoints (for frontend to consume)
	mux.HandleFunc("/api/therapies", router.therapyHandler.HandleTherapies)
	mux.HandleFunc("/api/therapies/", router.therapyHandler.HandleTherapies)

	// Public article endpoints (for frontend to consume)
	mux.HandleFunc("/api/articles", router.articleHandler.HandleArticles)
	mux.HandleFunc("/api/articles/", router.articleHandler.HandleArticles)

	// Wrap with CORS middleware
	return router.corsMiddleware(mux)
}

func (router *Router) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3004")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
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
