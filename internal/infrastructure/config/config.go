package config

import (
	"fmt"
	"time"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	RabbitMQ RabbitMQConfig
	Auth     AuthConfig
	App      AppConfig
}

type ServerConfig struct {
	Host         string
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

type DatabaseConfig struct {
	Host            string
	Port            int
	User            string
	Password        string
	Name            string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type RabbitMQConfig struct {
	URL               string
	ExchangeName      string
	QueueName         string
	RoutingKey        string
	ConnectionTimeout time.Duration
}

type AuthConfig struct {
	JWTSecret  string
	TokenTTL   time.Duration
	RefreshTTL time.Duration
	BcryptCost int
}

type AppConfig struct {
	Name        string
	Version     string
	Environment string
	LogLevel    string
	Debug       bool
}

// Load loads configuration using the configuration service
func Load() (*Config, error) {
	service := NewConfigService()
	return service.Load()
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.Database.Password == "" && c.App.Environment == "production" {
		return fmt.Errorf("database password is required in production")
	}

	if c.Auth.JWTSecret == "your-secret-key-change-in-production" && c.App.Environment == "production" {
		return fmt.Errorf("JWT secret must be changed in production")
	}

	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("invalid server port: %d", c.Server.Port)
	}

	return nil
}

// DatabaseDSN returns the PostgreSQL connection string
func (c *Config) DatabaseDSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.Name,
		c.Database.SSLMode,
	)
}

// ServerAddress returns the server address
func (c *Config) ServerAddress() string {
	return fmt.Sprintf("%s:%d", c.Server.Host, c.Server.Port)
}
