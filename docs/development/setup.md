# Development Setup

Complete guide to setting up the Thappy development environment.

## Prerequisites

### Required Software

1. **Go 1.24+**
   ```bash
   # Check version
   go version
   
   # Install from https://golang.org/dl/ if needed
   ```

2. **Docker & Docker Compose**
   ```bash
   # Check versions
   docker --version
   docker-compose --version
   
   # Install from https://docs.docker.com/get-docker/ if needed
   ```

3. **Git**
   ```bash
   git --version
   ```

4. **Make** (usually pre-installed on Linux/macOS)
   ```bash
   make --version
   ```

### Optional Tools

- **jq** - For JSON parsing in test scripts
- **PostgreSQL client** - For direct database access
- **Postman** or similar - For API testing

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd thappy
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your preferred settings
# Note: Docker Compose overrides most settings
```

### 3. Start Development Environment

```bash
# Start all services (API, PostgreSQL, RabbitMQ)
make dev

# Or start in detached mode
make dev-detached
```

### 4. Verify Setup

```bash
# Check service status
docker-compose ps

# Test API health
curl http://localhost:8080/health

# Run test suite
./test/curl/run-all-tests.sh
```

## Development Workflow

### Daily Workflow

```bash
# Start development
make dev-detached

# Run tests during development
make test

# Check code quality
make lint
make format

# Stop when done
make stop
```

### Making Changes

1. **Write Tests First** (TDD approach)
   ```bash
   # Run specific tests
   go test ./internal/domain/user -v
   go test ./internal/service/user -v
   ```

2. **Implement Code**
   - Follow existing patterns and structure
   - Keep functions small and focused
   - Use proper error handling

3. **Run Quality Checks**
   ```bash
   make test
   make lint
   make format
   ```

4. **Test API Endpoints**
   ```bash
   # Test specific functionality
   ./test/curl/01-register-users.sh
   ./test/curl/02-login-users.sh
   ```

## Project Structure

```
thappy/
├── cmd/
│   └── api/              # Application entry points
├── internal/
│   ├── domain/           # Domain entities and interfaces
│   │   └── user/
│   ├── service/          # Business logic
│   │   ├── auth/         # Authentication services
│   │   └── user/         # User services
│   ├── repository/       # Data access layer
│   │   └── user/
│   │       └── postgres/
│   ├── handler/          # HTTP handlers
│   │   ├── http/         # HTTP utilities
│   │   └── user/         # User handlers
│   └── infrastructure/   # Infrastructure components
│       ├── config/       # Configuration management
│       ├── container/    # Dependency injection
│       ├── database/     # Database connections
│       └── messaging/    # Message queue
├── migrations/           # Database migrations
├── test/                # Test utilities and scripts
│   └── curl/            # API test scripts
├── docs/                # Documentation
└── docker-compose.yml   # Development environment
```

## Development Commands

### Essential Commands

```bash
# Development environment
make dev              # Start all services (interactive)
make dev-detached     # Start all services (background)
make stop             # Stop all services
make clean            # Stop and remove containers/volumes

# Code quality
make test             # Run all tests
make test-coverage    # Run tests with coverage
make lint             # Run linters
make format           # Format code
make mod-tidy         # Clean up Go modules

# Database
make migrate-up       # Apply migrations
make migrate-down     # Rollback migrations
make db-shell         # Connect to database
make health           # Check API health
```

### Testing Commands

```bash
# Unit tests
go test ./...                    # All tests
go test ./internal/domain/user   # Domain tests
go test ./internal/service/user  # Service tests

# Integration tests
make test-all                    # All tests including integration

# API tests
./test/curl/run-all-tests.sh          # Complete API test suite
./test/curl/01-register-users.sh      # Registration tests
./test/curl/02-login-users.sh         # Login tests
./test/curl/03-protected-endpoints.sh # Protected endpoints
./test/curl/04-error-scenarios.sh     # Error scenarios
```

### Database Commands

```bash
# Migration management
make migrate-up                  # Apply all pending migrations
make migrate-down               # Rollback last migration
make migrate-create NAME=add_feature # Create new migration

# Database access
make db-shell                   # PostgreSQL shell
docker-compose exec postgres psql -U thappy -d thappy

# Database queries
docker-compose exec postgres psql -U thappy -d thappy -c "SELECT COUNT(*) FROM users;"
```

## Configuration

### Environment Variables

Development settings are in `docker-compose.yml`. Key variables:

```yaml
# Server
SERVER_HOST: 0.0.0.0
SERVER_PORT: 8080

# Database  
DB_HOST: postgres
DB_PORT: 5432
DB_USER: thappy
DB_PASSWORD: thappy_dev_password
DB_NAME: thappy

# Authentication
JWT_SECRET: thappy-dev-secret-change-in-production
JWT_TOKEN_TTL: 24h

# RabbitMQ
RABBITMQ_URL: amqp://thappy:thappy_dev_password@rabbitmq:5672/
```

### Port Mappings

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| API | 8080 | 8080 | HTTP API |
| PostgreSQL | 5432 | 5433 | Database |
| RabbitMQ | 5672 | 5672 | Message Queue |
| RabbitMQ Management | 15672 | 15672 | Web Interface |

### Database Connection

```bash
# From host machine
psql -h localhost -p 5433 -U thappy -d thappy

# From Docker container
docker-compose exec postgres psql -U thappy -d thappy

# Connection string
postgres://thappy:thappy_dev_password@localhost:5433/thappy
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8080
   lsof -i :5433
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Migration Errors**
   ```bash
   # Check SELinux (if on RHEL/Fedora/CentOS)
   getenforce
   
   # Migration files need :Z flag in volume mount
   # Already configured in docker-compose.yml
   ```

4. **Test Failures**
   ```bash
   # Ensure API is running
   curl http://localhost:8080/health
   
   # Clean test artifacts
   rm -f test/curl/tokens.txt
   
   # Check database state
   make db-shell
   ```

### Getting Help

1. **Check Logs**
   ```bash
   docker-compose logs api
   docker-compose logs postgres
   docker-compose logs rabbitmq
   ```

2. **Verify Configuration**
   ```bash
   # Check environment
   docker-compose config
   
   # Check health
   make health
   ```

3. **Reset Environment**
   ```bash
   # Nuclear option - clean everything
   make clean
   docker-compose down -v
   docker-compose up -d --build
   ```

## IDE Setup

### VS Code

Recommended extensions:
- Go (official)
- Docker
- PostgreSQL
- REST Client
- GitLens

Settings:
```json
{
  "go.toolsManagement.autoUpdate": true,
  "go.useLanguageServer": true,
  "go.formatTool": "gofmt",
  "go.lintTool": "golangci-lint"
}
```

### GoLand

- Enable Go modules support
- Configure database connection
- Set up Docker integration
- Configure code style to match project

## Performance Tips

1. **Use Docker BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Parallel Test Execution**
   ```bash
   go test -parallel 4 ./...
   ```

3. **Skip Integration Tests During Development**
   ```bash
   go test -short ./...
   ```

4. **Use Docker Compose Override**
   Create `docker-compose.override.yml` for local customizations