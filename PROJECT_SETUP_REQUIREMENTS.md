# Project Setup Requirements

## Architecture Overview

This is a full-stack therapy platform with:
- **Go backend** providing REST APIs (port 8081)
- **React TypeScript frontend** for user interface (port 3004)
- **PostgreSQL** for data persistence (port 5433 local)
- **RabbitMQ** for message queuing (port 5672)
- **Nginx proxy** for API routing and CORS handling

## Core Components

### 1. Docker & Docker Compose
- `docker-compose.yml` - Default (local development)
- `docker-compose.local.yml` - Explicit local development setup
- `docker-compose.prod.yml` - Production environment
- `.dockerignore` - Exclude unnecessary files from Docker context
- `Dockerfile` - Multi-stage build for Go application
- `frontend/Dockerfile` - Multi-stage build for React application with nginx

### 2. Go Backend Structure
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

### 3. React Frontend Structure
```
/frontend
  /public - Static assets (index.html, favicon, etc.)
  /src
    /components - Reusable UI components
      /auth - Authentication components
      /common - Shared components (Header, Layout, etc.)
    /pages - Route-level page components
      /auth - Login, Register pages
      /public - Public content pages (Therapies, Topics, Help)
      /client - Client dashboard
      /therapist - Therapist dashboard
    /context - React Context providers (Auth, Notifications)
    /hooks - Custom React hooks
    /services - API service layer
    /styles - CSS styling system
    /utils - Utility functions
  package.json - Dependencies and scripts
  tsconfig.json - TypeScript configuration
```

### 4. PostgreSQL Setup
- Database initialization scripts
- Migration tool (golang-migrate or goose)
- Connection pooling configuration
- Health check endpoint

### 5. RabbitMQ Setup
- Queue definitions
- Exchange and routing configuration
- Consumer/Producer patterns
- Dead letter queue setup
- Management UI access

### 6. Development Environment Files
- `.env.example` - Environment variables template
- `.gitignore` - Version control exclusions
- `Makefile` - Common commands and tasks
- `go.mod` & `go.sum` - Go dependencies

### 7. Code Quality Tools
- **Linting**: golangci-lint configuration (`.golangci.yml`)
- **Formatting**: gofmt, goimports
- **Security**: gosec for security checks
- **Testing**: go test with coverage reports
- **Pre-commit hooks**: `.pre-commit-config.yaml`

### 8. Testing Setup
- Unit tests (`*_test.go`)
- Integration tests (`/tests/integration`)
- Test database container
- Mocked RabbitMQ for tests
- `testcontainers-go` for integration testing

### 9. CI/CD Pipeline (GitHub Actions)
```
.github/workflows/
  - ci.yml (lint, test, build)
  - release.yml (semantic versioning)
```

### 10. Documentation
- `README.md` - Project overview and setup instructions
- `API.md` - API documentation
- OpenAPI/Swagger specification (`/docs/swagger.yaml`)

### 11. Monitoring & Logging
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

3. **Makefile** (Professional with 30 essential commands)
   ```makefile
   # Development
   - make dev              # Start full Docker environment
   - make dev-local        # Start local development (no Docker)
   - make setup            # Initialize project
   - make clean            # Clean development environment
   - make status           # Check service health

   # Building & Testing
   - make build            # Build backend for production
   - make test             # Run all tests
   - make test-backend     # Run Go tests only
   - make test-frontend    # Run React tests only

   # Code Quality
   - make lint             # Run all linters
   - make format           # Format code
   - make ci               # Full CI pipeline

   # Database
   - make migrate-up       # Run migrations
   - make migrate-create   # Create new migration
   - make db-shell         # Connect to database

   # Production
   - make prod             # Start production environment
   - make prod-stop        # Stop production
   - make prod-logs        # View production logs
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

### Backend Commands
```bash
# Start all services (backend + database + RabbitMQ)
make run

# Run Go tests
make test

# Run Go linting
make lint

# Database migrations
make migrate-up
make migrate-down

# Build production image
make build-prod

# Clean up
make clean
```

### Frontend Commands
```bash
# Install dependencies
cd frontend && pnpm install

# Start development server (port 3004)
cd frontend && pnpm start

# Restart development server (kills existing and starts fresh)
cd frontend && pnpm run restart

# Fresh restart with cache clearing
cd frontend && pnpm run restart:fresh

# Clear cache and reinstall
cd frontend && pnpm run clean

# Run TypeScript compiler
cd frontend && pnpm run type-check

# Run linting
cd frontend && pnpm run lint

# Build for production
cd frontend && pnpm run build

# Run tests
cd frontend && pnpm test
```

## Local Development Ports

### Docker Development (`make dev`)
- **Frontend**: http://localhost:3004 (nginx proxy)
- **Backend API**: http://localhost:8081 (direct access)
- **API via Proxy**: http://localhost:3004/api/* (CORS-free)
- **PostgreSQL**: localhost:5433 (mapped from 5432)
- **RabbitMQ Management**: http://localhost:15672
- **Health Check**: http://localhost:8081/health

### Local Development (`make dev-local`)
- **Frontend**: http://localhost:3004 (React dev server)
- **Backend API**: http://localhost:8081 (Go server)
- **PostgreSQL**: localhost:5433 (Docker container)
- **RabbitMQ**: localhost:5672 (Docker container)

## Dependencies to Include

### Backend Dependencies (Go)

#### Minimal Core Dependencies
- **Database**: `jackc/pgx/v5` - PostgreSQL driver with excellent performance
- **Migration**: `golang-migrate/migrate/v4` - Database schema versioning
- **RabbitMQ**: `rabbitmq/amqp091-go` - Official RabbitMQ client
- **Environment**: `joho/godotenv` - Simple .env file loading (development only)

#### Optional Dependencies (Add as needed)
- **HTTP Router**: Standard library `net/http` with `chi` or `httprouter` if needed for complex routing
- **Logging**: `log/slog` (Go 1.21+ standard library) or `rs/zerolog` for structured logging
- **Validation**: Write custom validators or use `go-playground/validator` if complex validation needed
- **Testing**: Standard library `testing` package, optionally add `stretchr/testify` for assertions
- **Integration Testing**: `testcontainers/testcontainers-go` for container-based tests

### Frontend Dependencies (React TypeScript)

#### Core Dependencies
- **React**: `react` and `react-dom` - UI library
- **TypeScript**: `typescript` - Type safety
- **React Router**: `react-router-dom` - Client-side routing

#### Current Dependencies (package.json)
- **Package Manager**: pnpm for faster installs and disk efficiency
- **Styling**: CSS Modules with CSS-in-JS patterns
- **Fonts**: Google Fonts (Inter) loaded via HTML
- **HTTP Client**: Fetch API (native browser support)
- **State Management**: React Context + hooks pattern
- **Build Tool**: Create React App (CRA) with TypeScript template
- **Development**: Enhanced cache clearing and restart scripts

#### Design System
- **CSS Variables**: Centralized design tokens in `variables.css`
- **Color Scheme**: Orange primary (`#f59e0b`) with semantic color tokens
- **Typography**: Inter font family with hierarchical scales
- **Layout**: CSS Grid and Flexbox for responsive design
- **Accessibility**: WCAG 2.1 compliant components

### Why Minimal Dependencies?

#### Backend Philosophy
- **Standard library first**: Go's `net/http`, `encoding/json`, `database/sql` are production-ready
- **Fewer dependencies**: Reduced security surface, easier updates, faster builds
- **Better understanding**: Writing some utilities yourself leads to better understanding
- **Performance**: Standard library is well-optimized
- **Maintainability**: Less breaking changes from third-party libraries

#### Frontend Philosophy
- **Essential only**: Only add dependencies that provide significant value
- **Bundle size**: Keep production bundle lean for better performance
- **Security**: Fewer dependencies mean fewer potential security vulnerabilities
- **Maintenance**: Easier to update and maintain with fewer moving parts