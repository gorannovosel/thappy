package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	httputil "github.com/goran/thappy/internal/handler/http"
	"github.com/goran/thappy/internal/infrastructure/container"
)

func main() {
	// Initialize dependency injection container
	container, err := container.NewContainer()
	if err != nil {
		log.Fatalf("Failed to initialize container: %v", err)
	}

	// Ensure graceful shutdown
	defer func() {
		if err := container.Close(); err != nil {
			log.Printf("Error during container shutdown: %v", err)
		}
	}()

	// Setup HTTP server
	server := &http.Server{
		Addr:         container.Config.ServerAddress(),
		Handler:      setupRoutes(container),
		ReadTimeout:  container.Config.Server.ReadTimeout,
		WriteTimeout: container.Config.Server.WriteTimeout,
		IdleTimeout:  container.Config.Server.IdleTimeout,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s", server.Addr)
		log.Printf("Environment: %s", container.Config.App.Environment)
		log.Printf("Version: %s", container.Config.App.Version)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Give the server 30 seconds to finish handling requests
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}

// setupRoutes configures all HTTP routes and middleware
func setupRoutes(container *container.Container) http.Handler {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Perform health checks
		if err := container.HealthCheck(); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","error":"%s"}`, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"healthy","service":"%s","version":"%s"}`,
			container.Config.App.Name,
			container.Config.App.Version,
		)
	})

	// Public endpoints (no authentication required)
	mux.Handle("/api/register", applyMiddleware(
		http.HandlerFunc(container.UserHandler.Register),
		httputil.JSONMiddleware,
	))

	mux.Handle("/api/login", applyMiddleware(
		http.HandlerFunc(container.UserHandler.Login),
		httputil.JSONMiddleware,
	))

	// Protected endpoints (authentication required)
	mux.Handle("/api/profile", applyMiddleware(
		http.HandlerFunc(container.UserHandler.GetProfile),
		container.AuthMiddleware.RequireAuth,
	))

	mux.Handle("/api/profile/update", applyMiddleware(
		http.HandlerFunc(container.UserHandler.UpdateProfile),
		httputil.JSONMiddleware,
		container.AuthMiddleware.RequireAuth,
	))

	// Apply global middleware
	return applyMiddleware(
		mux,
		httputil.CORSMiddleware,
		httputil.LoggingMiddleware,
	)
}

// applyMiddleware applies middleware functions in reverse order (last middleware wraps first)
func applyMiddleware(handler http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}
