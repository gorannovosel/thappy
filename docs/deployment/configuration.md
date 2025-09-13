# Configuration Management

Complete guide to configuration management in the Thappy API.

## Configuration Strategy

### Environment Variable Precedence

Configuration is loaded in this order (highest to lowest priority):

1. **Docker Compose Environment** (when running with Docker)
2. **System Environment Variables**
3. **`.env` file** (local development)
4. **Default values** (in code)

### Why Multiple Configuration Sources?

- **`.env` file**: Local development convenience
- **Docker Compose**: Container-specific overrides
- **Environment Variables**: Production deployment flexibility
- **Defaults**: Fallback values for development

## Configuration Files

### 1. `.env.example` (Template)

This is the **template file** that should be copied to create `.env`:

```bash
# Copy template to create local config
cp .env.example .env
```

**Purpose**: 
- Documents all available configuration options
- Provides safe default values for development
- Committed to git as documentation

### 2. `.env` (Local Development)

This is your **local configuration file**:

```bash
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database Configuration  
DB_HOST=localhost
DB_PORT=5433
DB_USER=thappy
DB_PASSWORD=thappy_dev_password
DB_NAME=thappy
```

**Purpose**:
- Local development settings
- **Not committed to git** (in .gitignore)
- Can be customized per developer

### 3. `docker-compose.yml` (Container Configuration)

Docker services use **environment sections**:

```yaml
api:
  environment:
    # Database configuration
    DB_HOST: postgres          # Internal Docker hostname
    DB_PORT: 5432             # Internal Docker port
    DB_USER: thappy
    DB_PASSWORD: thappy_dev_password
    DB_NAME: thappy
```

**Purpose**:
- Container-specific configuration
- Overrides `.env` values when running with Docker
- Uses internal Docker hostnames and ports

## Current Configuration State

### Database Connection

| Context | Host | Port | Password | Notes |
|---------|------|------|----------|-------|
| **Host Machine** | `localhost` | `5433` | `thappy_dev_password` | External connection |
| **Docker Container** | `postgres` | `5432` | `thappy_dev_password` | Internal connection |
| **Docker Compose** | `postgres` | `5432` | `thappy_dev_password` | Service name + internal port |

### Why Different Ports?

- **5432**: Internal PostgreSQL port (inside Docker)
- **5433**: External mapped port (on host machine)

```yaml
postgres:
  ports:
    - "5433:5432"  # host:container
```

This avoids conflicts with system PostgreSQL running on port 5432.

## Configuration Structure

### Complete Configuration

```go
type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
    RabbitMQ RabbitMQConfig
    Auth     AuthConfig
    App      AppConfig
}
```

### Environment Variables

#### Server Configuration
```bash
SERVER_HOST=0.0.0.0              # Bind address
SERVER_PORT=8080                 # HTTP port
SERVER_READ_TIMEOUT=30s          # Request read timeout
SERVER_WRITE_TIMEOUT=30s         # Response write timeout  
SERVER_IDLE_TIMEOUT=120s         # Keep-alive timeout
```

#### Database Configuration
```bash
DB_HOST=localhost                # Database host
DB_PORT=5433                     # Database port
DB_USER=thappy                   # Database username
DB_PASSWORD=thappy_dev_password  # Database password
DB_NAME=thappy                   # Database name
DB_SSLMODE=disable              # SSL mode (disable for dev)
DB_MAX_OPEN_CONNS=25            # Max open connections
DB_MAX_IDLE_CONNS=5             # Max idle connections
DB_CONN_MAX_LIFETIME=300s       # Connection lifetime
```

#### RabbitMQ Configuration
```bash
RABBITMQ_URL=amqp://guest:guest@localhost:5672/
RABBITMQ_EXCHANGE=thappy
RABBITMQ_QUEUE=thappy_queue
RABBITMQ_ROUTING_KEY=thappy.events
RABBITMQ_CONNECTION_TIMEOUT=30s
```

#### Authentication Configuration
```bash
JWT_SECRET=thappy-dev-secret-change-in-production  # JWT signing secret
JWT_TOKEN_TTL=24h                                  # Token lifetime
JWT_REFRESH_TTL=168h                              # Refresh token lifetime
BCRYPT_COST=12                                    # Password hashing cost
```

#### Application Configuration
```bash
APP_NAME=thappy                  # Application name
APP_VERSION=1.0.0               # Application version
APP_ENV=development             # Environment (development/production)
LOG_LEVEL=info                  # Logging level
DEBUG=false                     # Debug mode
```

## Development vs Production

### Development Configuration

```bash
# Development settings (.env)
APP_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Weak secrets (development only)
JWT_SECRET=thappy-dev-secret-change-in-production
DB_PASSWORD=thappy_dev_password

# Relaxed security
DB_SSLMODE=disable
BCRYPT_COST=10
```

### Production Configuration

```bash
# Production settings (environment variables)
APP_ENV=production
DEBUG=false
LOG_LEVEL=info

# Strong secrets
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 20)

# Strict security
DB_SSLMODE=require
BCRYPT_COST=14
JWT_TOKEN_TTL=1h
```

## Configuration Validation

### Validation Rules

The config service validates:

1. **Required Fields**: Database password, JWT secret
2. **Environment-Specific**: Production requires strong secrets
3. **Port Ranges**: Server port must be 1-65535
4. **Format Validation**: URLs, timeouts, etc.

### Validation Example

```go
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
```

## Configuration Loading

### Loading Process

1. **Load defaults** from code
2. **Load .env file** if exists
3. **Override with environment variables**
4. **Validate configuration**
5. **Return typed config struct**

### Code Example

```go
// Load configuration
config, err := config.Load()
if err != nil {
    log.Fatalf("Failed to load configuration: %v", err)
}

// Access typed configuration
fmt.Printf("Server will start on %s\n", config.ServerAddress())
fmt.Printf("Database: %s\n", config.DatabaseDSN())
```

## Troubleshooting Configuration

### Common Issues

1. **Wrong Database Password**
   ```bash
   # Check what's actually being used
   docker-compose exec api env | grep DB_
   
   # Compare with .env file
   grep DB_ .env
   ```

2. **Port Conflicts**
   ```bash
   # Check if port is in use
   lsof -i :8080
   lsof -i :5433
   
   # Change ports in docker-compose.yml if needed
   ```

3. **Missing Environment Variables**
   ```bash
   # Validate configuration
   make health
   
   # Check service logs
   docker-compose logs api
   ```

### Configuration Debugging

```bash
# Check current configuration
docker-compose config

# View environment variables in container
docker-compose exec api env

# Test configuration loading
go run cmd/api/main.go --config-test
```

## Security Best Practices

### Development Security

✅ **Do:**
- Use weak secrets for development (documented)
- Disable SSL for local development
- Use simple passwords for test databases

❌ **Don't:**
- Commit real secrets to git
- Use production credentials in development
- Share .env files between developers

### Production Security

✅ **Do:**
- Use strong, random secrets
- Enable SSL/TLS everywhere
- Use environment variables for secrets
- Rotate secrets regularly
- Use secret management services

❌ **Don't:**
- Use default/example passwords
- Store secrets in configuration files
- Use development credentials
- Share secrets in plain text

## Environment-Specific Examples

### Docker Compose (Current Setup)

```yaml
# What we have now - container environment
api:
  environment:
    DB_HOST: postgres              # Docker service name
    DB_PORT: 5432                 # Internal port
    DB_PASSWORD: thappy_dev_password
    JWT_SECRET: thappy-dev-secret-change-in-production
```

### Kubernetes Deployment (Future)

```yaml
# Example Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: api
        env:
        - name: DB_HOST
          value: "postgres-service"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
```

### Docker Swarm (Future)

```yaml
# Example Docker Swarm service
version: '3.8'
services:
  api:
    environment:
      DB_HOST: postgres
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

## Configuration Updates

When updating configuration:

1. **Update `.env.example`** with new options
2. **Document changes** in this file
3. **Update validation** if adding required fields
4. **Test with both Docker and local** setups
5. **Update documentation** and examples

### Recent Changes

- ✅ Fixed password inconsistency between .env and docker-compose.yml
- ✅ Standardized port configuration (5433 external, 5432 internal)
- ✅ Aligned .env.example with actual usage