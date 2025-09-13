package container

import (
	"context"
	"fmt"
	"time"

	clientDomain "github.com/goran/thappy/internal/domain/client"
	therapistDomain "github.com/goran/thappy/internal/domain/therapist"
	"github.com/goran/thappy/internal/domain/user"
	"github.com/goran/thappy/internal/handler"
	httputil "github.com/goran/thappy/internal/handler/http"
	userHandler "github.com/goran/thappy/internal/handler/user"
	"github.com/goran/thappy/internal/infrastructure/config"
	"github.com/goran/thappy/internal/infrastructure/database"
	"github.com/goran/thappy/internal/infrastructure/messaging"
	clientRepository "github.com/goran/thappy/internal/repository/client/postgres"
	therapistRepository "github.com/goran/thappy/internal/repository/therapist/postgres"
	userRepository "github.com/goran/thappy/internal/repository/user/postgres"
	authService "github.com/goran/thappy/internal/service/auth"
	clientService "github.com/goran/thappy/internal/service/client"
	therapistService "github.com/goran/thappy/internal/service/therapist"
	userService "github.com/goran/thappy/internal/service/user"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Container holds all application dependencies
type Container struct {
	Config *config.Config

	// Infrastructure
	DB       *pgxpool.Pool
	RabbitMQ *messaging.RabbitMQConnection

	// Services
	UserService      user.UserService
	TokenService     user.TokenService
	ClientService    clientDomain.ClientService
	TherapistService therapistDomain.TherapistService

	// Repositories
	UserRepository      user.UserRepository
	ClientRepository    clientDomain.ClientRepository
	TherapistRepository therapistDomain.TherapistRepository

	// Handlers
	UserHandler    *userHandler.Handler
	Router         *handler.Router
	AuthMiddleware *httputil.AuthMiddleware

	// HTTP utilities
	ResponseWriter *httputil.ResponseWriter
	ErrorHandler   *httputil.ErrorHandler
}

// NewContainer creates and initializes a new dependency injection container
func NewContainer() (*Container, error) {
	container := &Container{}

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}
	container.Config = cfg

	// Initialize infrastructure
	if err := container.initInfrastructure(); err != nil {
		return nil, fmt.Errorf("failed to initialize infrastructure: %w", err)
	}

	// Initialize repositories
	if err := container.initRepositories(); err != nil {
		return nil, fmt.Errorf("failed to initialize repositories: %w", err)
	}

	// Initialize services
	if err := container.initServices(); err != nil {
		return nil, fmt.Errorf("failed to initialize services: %w", err)
	}

	// Initialize handlers
	if err := container.initHandlers(); err != nil {
		return nil, fmt.Errorf("failed to initialize handlers: %w", err)
	}

	return container, nil
}

// initInfrastructure initializes database and messaging connections
func (c *Container) initInfrastructure() error {
	// Initialize database
	db, err := database.NewPostgresConnection(c.Config)
	if err != nil {
		return fmt.Errorf("failed to initialize database: %w", err)
	}
	c.DB = db

	// Initialize RabbitMQ (optional for now)
	if c.Config.RabbitMQ.URL != "" {
		rabbitmq, err := messaging.NewRabbitMQConnection(c.Config)
		if err != nil {
			// Log warning but don't fail startup
			fmt.Printf("Warning: failed to initialize RabbitMQ: %v\n", err)
		} else {
			c.RabbitMQ = rabbitmq
		}
	}

	return nil
}

// initRepositories initializes all repositories
func (c *Container) initRepositories() error {
	// User repository
	c.UserRepository = userRepository.NewUserRepository(c.DB)

	// Client repository
	c.ClientRepository = clientRepository.NewClientRepository(c.DB)

	// Therapist repository
	c.TherapistRepository = therapistRepository.NewTherapistRepository(c.DB)

	return nil
}

// initServices initializes all services
func (c *Container) initServices() error {
	// Token service
	c.TokenService = authService.NewJWTTokenService(
		c.Config.Auth.JWTSecret,
		c.Config.Auth.TokenTTL,
	)

	// User service
	c.UserService = userService.NewUserService(
		c.UserRepository,
		c.TokenService,
	)

	// Client service
	c.ClientService = clientService.NewClientService(
		c.ClientRepository,
		c.UserRepository,
	)

	// Therapist service
	c.TherapistService = therapistService.NewTherapistService(
		c.TherapistRepository,
		c.UserRepository,
	)

	return nil
}

// initHandlers initializes HTTP handlers and utilities
func (c *Container) initHandlers() error {
	// HTTP utilities
	c.ResponseWriter = httputil.NewResponseWriter()
	c.ErrorHandler = httputil.NewErrorHandler()

	// Auth middleware
	c.AuthMiddleware = httputil.NewAuthMiddleware(
		c.TokenService,
		c.UserService,
	)

	// User handler
	c.UserHandler = userHandler.NewHandler(c.UserService)

	// Router with all handlers
	c.Router = handler.NewRouter(
		c.UserService,
		c.ClientService,
		c.TherapistService,
		c.TokenService,
	)

	return nil
}

// Close gracefully shuts down all connections
func (c *Container) Close() error {
	var errors []error

	// Close RabbitMQ connection
	if c.RabbitMQ != nil {
		c.RabbitMQ.Close()
	}

	// Close database connection
	if c.DB != nil {
		database.CloseConnection(c.DB)
	}

	// Return any errors that occurred during shutdown
	if len(errors) > 0 {
		return fmt.Errorf("errors during shutdown: %v", errors)
	}

	return nil
}

// HealthCheck performs a health check on all dependencies
func (c *Container) HealthCheck() error {
	// Check database
	if c.DB != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := c.DB.Ping(ctx); err != nil {
			return fmt.Errorf("database health check failed: %w", err)
		}
	}

	// Check RabbitMQ
	if c.RabbitMQ != nil && !c.RabbitMQ.IsConnected() {
		return fmt.Errorf("RabbitMQ connection is not healthy")
	}

	return nil
}
