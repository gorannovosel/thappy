package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	// Use the router from the container which has all the new endpoints
	return container.Router.SetupRoutes()
}
