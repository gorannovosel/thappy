# Project Setup Requirements

## Core Components

### 1. Docker & Docker Compose
- `docker-compose.yml` - Orchestrate all services
- `.dockerignore` - Exclude unnecessary files from Docker context
- `Dockerfile` - Multi-stage build for Go application

### 2. Go Application Structure
```
/cmd
  /api - Main application entry point
/internal
  /config - Configuration management
  /handler - HTTP handlers
  /service - Business logic
  /repository - Database interactions
  /middleware - HTTP middleware
  /model - Domain models
/pkg - Shared packages
/migrations - Database migrations
```

### 3. PostgreSQL Setup
- Database initialization scripts
- Migration tool (golang-migrate or goose)
- Connection pooling configuration
- Health check endpoint

### 4. RabbitMQ Setup
- Queue definitions
- Exchange and routing configuration
- Consumer/Producer patterns
- Dead letter queue setup
- Management UI access

### 5. Development Environment Files
- `.env.example` - Environment variables template
- `.gitignore` - Version control exclusions
- `Makefile` - Common commands and tasks
- `go.mod` & `go.sum` - Go dependencies

### 6. Code Quality Tools
- **Linting**: golangci-lint configuration (`.golangci.yml`)
- **Formatting**: gofmt, goimports
- **Security**: gosec for security checks
- **Testing**: go test with coverage reports
- **Pre-commit hooks**: `.pre-commit-config.yaml`

### 7. Testing Setup
- Unit tests (`*_test.go`)
- Integration tests (`/tests/integration`)
- Test database container
- Mocked RabbitMQ for tests
- `testcontainers-go` for integration testing

### 8. CI/CD Pipeline (GitHub Actions)
```
.github/workflows/
  - ci.yml (lint, test, build)
  - release.yml (semantic versioning)
```

### 9. Documentation
- `README.md` - Project overview and setup instructions
- `API.md` - API documentation
- OpenAPI/Swagger specification (`/docs/swagger.yaml`)

### 10. Monitoring & Logging
- Structured logging (zerolog or zap)
- Health check endpoints
- Prometheus metrics endpoint
- Graceful shutdown handling

## Required Files to Create

### Essential Configuration Files

1. **docker-compose.yml**
   - Go app service
   - PostgreSQL service
   - RabbitMQ service
   - Network configuration
   - Volume mounts

2. **Dockerfile**
   - Build stage with dependencies
   - Final minimal runtime image
   - Non-root user execution

3. **Makefile**
   ```makefile
   - make run (docker-compose up)
   - make build
   - make test
   - make lint
   - make migrate-up
   - make migrate-down
   - make clean
   ```

4. **.env.example**
   ```env
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=appuser
   DB_PASSWORD=secretpass
   DB_NAME=appdb
   
   RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
   
   APP_PORT=8080
   APP_ENV=development
   LOG_LEVEL=debug
   ```

5. **.golangci.yml**
   - Enable linters: govet, errcheck, staticcheck, gosec
   - Custom rules for project standards

6. **go.mod**
   ```go
   module github.com/goran/thappy
   
   go 1.21
   ```

## Development Workflow Commands

```bash
# Start all services
make run

# Run tests
make test

# Run linting
make lint

# Database migrations
make migrate-up
make migrate-down

# Build production image
make build-prod

# Clean up
make clean
```

## Local Development Ports
- API: http://localhost:8080
- PostgreSQL: localhost:5432
- RabbitMQ Management: http://localhost:15672
- Prometheus Metrics: http://localhost:8080/metrics
- Health Check: http://localhost:8080/health

## Dependencies to Include

### Minimal Core Dependencies
- **Database**: `jackc/pgx/v5` - PostgreSQL driver with excellent performance
- **Migration**: `golang-migrate/migrate/v4` - Database schema versioning
- **RabbitMQ**: `rabbitmq/amqp091-go` - Official RabbitMQ client
- **Environment**: `joho/godotenv` - Simple .env file loading (development only)

### Optional Dependencies (Add as needed)
- **HTTP Router**: Standard library `net/http` with `chi` or `httprouter` if needed for complex routing
- **Logging**: `log/slog` (Go 1.21+ standard library) or `rs/zerolog` for structured logging
- **Validation**: Write custom validators or use `go-playground/validator` if complex validation needed
- **Testing**: Standard library `testing` package, optionally add `stretchr/testify` for assertions
- **Integration Testing**: `testcontainers/testcontainers-go` for container-based tests

### Why Minimal Dependencies?
- **Standard library first**: Go's `net/http`, `encoding/json`, `database/sql` are production-ready
- **Fewer dependencies**: Reduced security surface, easier updates, faster builds
- **Better understanding**: Writing some utilities yourself leads to better understanding
- **Performance**: Standard library is well-optimized
- **Maintainability**: Less breaking changes from third-party libraries