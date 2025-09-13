package config

import (
	"fmt"
	"log"
	"os"
	"reflect"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// ConfigService provides centralized configuration management
type ConfigService struct {
	config *Config
	loaded bool
}

// NewConfigService creates a new configuration service
func NewConfigService() *ConfigService {
	return &ConfigService{}
}

// Load loads configuration from multiple sources in order of precedence:
// 1. Environment variables
// 2. .env file
// 3. Default values
func (cs *ConfigService) Load(envFiles ...string) (*Config, error) {
	if cs.loaded {
		return cs.config, nil
	}

	// Load .env files (if they exist)
	cs.loadEnvFiles(envFiles...)

	// Create config with defaults and env overrides
	config, err := cs.buildConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to build configuration: %w", err)
	}

	// Validate configuration
	if err := cs.validateConfig(config); err != nil {
		return nil, fmt.Errorf("configuration validation failed: %w", err)
	}

	cs.config = config
	cs.loaded = true

	// Log configuration summary (without secrets)
	cs.logConfigSummary()

	return cs.config, nil
}

// loadEnvFiles loads .env files in order, later files override earlier ones
func (cs *ConfigService) loadEnvFiles(envFiles ...string) {
	// Default files to try
	defaultFiles := []string{".env.local", ".env"}

	// Combine with provided files
	allFiles := append(envFiles, defaultFiles...)

	for _, file := range allFiles {
		if _, err := os.Stat(file); err == nil {
			if err := godotenv.Load(file); err != nil {
				log.Printf("Warning: failed to load %s: %v", file, err)
			} else {
				log.Printf("Loaded configuration from %s", file)
			}
		}
	}
}

// buildConfig builds the configuration from environment variables and defaults
func (cs *ConfigService) buildConfig() (*Config, error) {
	return &Config{
		Server: ServerConfig{
			Host:         cs.getString("SERVER_HOST", "0.0.0.0"),
			Port:         cs.getInt("SERVER_PORT", 8080),
			ReadTimeout:  cs.getDuration("SERVER_READ_TIMEOUT", 30*time.Second),
			WriteTimeout: cs.getDuration("SERVER_WRITE_TIMEOUT", 30*time.Second),
			IdleTimeout:  cs.getDuration("SERVER_IDLE_TIMEOUT", 120*time.Second),
		},
		Database: DatabaseConfig{
			Host:            cs.getString("DB_HOST", "localhost"),
			Port:            cs.getInt("DB_PORT", 5432),
			User:            cs.getString("DB_USER", "thappy"),
			Password:        cs.getStringRequired("DB_PASSWORD"),
			Name:            cs.getString("DB_NAME", "thappy"),
			SSLMode:         cs.getString("DB_SSLMODE", "disable"),
			MaxOpenConns:    cs.getInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    cs.getInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: cs.getDuration("DB_CONN_MAX_LIFETIME", 300*time.Second),
		},
		RabbitMQ: RabbitMQConfig{
			URL:               cs.getString("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
			ExchangeName:      cs.getString("RABBITMQ_EXCHANGE", "thappy"),
			QueueName:         cs.getString("RABBITMQ_QUEUE", "thappy_queue"),
			RoutingKey:        cs.getString("RABBITMQ_ROUTING_KEY", "thappy.events"),
			ConnectionTimeout: cs.getDuration("RABBITMQ_CONNECTION_TIMEOUT", 30*time.Second),
		},
		Auth: AuthConfig{
			JWTSecret:  cs.getStringRequired("JWT_SECRET"),
			TokenTTL:   cs.getDuration("JWT_TOKEN_TTL", 24*time.Hour),
			RefreshTTL: cs.getDuration("JWT_REFRESH_TTL", 7*24*time.Hour),
			BcryptCost: cs.getInt("BCRYPT_COST", 12),
		},
		App: AppConfig{
			Name:        cs.getString("APP_NAME", "thappy"),
			Version:     cs.getString("APP_VERSION", "1.0.0"),
			Environment: cs.getString("APP_ENV", "development"),
			LogLevel:    cs.getString("LOG_LEVEL", "info"),
			Debug:       cs.getBool("DEBUG", false),
		},
	}, nil
}

// validateConfig validates the entire configuration
func (cs *ConfigService) validateConfig(config *Config) error {
	var errors []string

	// Server validation
	if config.Server.Port < 1 || config.Server.Port > 65535 {
		errors = append(errors, fmt.Sprintf("invalid server port: %d", config.Server.Port))
	}

	// Database validation
	if config.Database.Password == "" && config.App.Environment == "production" {
		errors = append(errors, "database password is required in production")
	}

	// Auth validation
	if config.Auth.JWTSecret == "" {
		errors = append(errors, "JWT secret is required")
	}
	if len(config.Auth.JWTSecret) < 32 && config.App.Environment == "production" {
		errors = append(errors, "JWT secret must be at least 32 characters in production")
	}
	if config.Auth.BcryptCost < 4 || config.Auth.BcryptCost > 31 {
		errors = append(errors, "bcrypt cost must be between 4 and 31")
	}

	// App validation
	validEnvs := []string{"development", "staging", "production"}
	if !slices.Contains(validEnvs, config.App.Environment) {
		errors = append(errors, fmt.Sprintf("invalid environment: %s (must be one of: %s)",
			config.App.Environment, strings.Join(validEnvs, ", ")))
	}

	if len(errors) > 0 {
		return fmt.Errorf("configuration errors:\n- %s", strings.Join(errors, "\n- "))
	}

	return nil
}

// logConfigSummary logs a summary of the loaded configuration (without secrets)
func (cs *ConfigService) logConfigSummary() {
	log.Printf("Configuration loaded:")
	log.Printf("  App: %s v%s (%s)", cs.config.App.Name, cs.config.App.Version, cs.config.App.Environment)
	log.Printf("  Server: %s (debug: %v)", cs.config.ServerAddress(), cs.config.App.Debug)
	log.Printf("  Database: %s:%d/%s", cs.config.Database.Host, cs.config.Database.Port, cs.config.Database.Name)
	log.Printf("  RabbitMQ: %s", cs.maskURL(cs.config.RabbitMQ.URL))
}

// Helper methods for type-safe environment variable access

func (cs *ConfigService) getString(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (cs *ConfigService) getStringRequired(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Printf("Warning: required environment variable %s is not set", key)
	}
	return value
}

func (cs *ConfigService) getInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
		log.Printf("Warning: invalid integer value for %s: %s, using default: %d", key, value, defaultValue)
	}
	return defaultValue
}

func (cs *ConfigService) getBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
		log.Printf("Warning: invalid boolean value for %s: %s, using default: %v", key, value, defaultValue)
	}
	return defaultValue
}

func (cs *ConfigService) getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
		log.Printf("Warning: invalid duration value for %s: %s, using default: %v", key, value, defaultValue)
	}
	return defaultValue
}

// Utility methods

func (cs *ConfigService) maskURL(url string) string {
	if strings.Contains(url, "@") {
		parts := strings.Split(url, "@")
		if len(parts) == 2 {
			return "***@" + parts[1]
		}
	}
	return url
}

// GetConfig returns the loaded configuration (must call Load first)
func (cs *ConfigService) GetConfig() *Config {
	if !cs.loaded {
		log.Fatal("Configuration not loaded. Call Load() first.")
	}
	return cs.config
}

// Reload reloads the configuration
func (cs *ConfigService) Reload(envFiles ...string) (*Config, error) {
	cs.loaded = false
	return cs.Load(envFiles...)
}

// IsProduction returns true if running in production environment
func (cs *ConfigService) IsProduction() bool {
	return cs.config != nil && cs.config.App.Environment == "production"
}

// IsDevelopment returns true if running in development environment
func (cs *ConfigService) IsDevelopment() bool {
	return cs.config != nil && cs.config.App.Environment == "development"
}

// PrintConfig prints the full configuration for debugging (masks secrets)
func (cs *ConfigService) PrintConfig() {
	if !cs.loaded {
		log.Println("Configuration not loaded")
		return
	}

	configValue := reflect.ValueOf(cs.config).Elem()
	configType := configValue.Type()

	log.Println("=== Configuration ===")
	cs.printStruct(configValue, configType, "")
}

func (cs *ConfigService) printStruct(value reflect.Value, structType reflect.Type, prefix string) {
	for i := range value.NumField() {
		field := value.Field(i)
		fieldType := structType.Field(i)
		fieldName := prefix + fieldType.Name

		if field.Kind() == reflect.Struct {
			log.Printf("%s:", fieldName)
			cs.printStruct(field, field.Type(), "  "+prefix)
		} else {
			fieldValue := field.Interface()

			// Mask sensitive fields
			if cs.isSensitiveField(fieldName) {
				fieldValue = "***"
			}

			log.Printf("%s: %v", fieldName, fieldValue)
		}
	}
}

func (cs *ConfigService) isSensitiveField(fieldName string) bool {
	sensitiveFields := []string{"Password", "JWTSecret", "Secret", "Key", "Token"}
	for _, sensitive := range sensitiveFields {
		if strings.Contains(fieldName, sensitive) {
			return true
		}
	}
	return false
}
