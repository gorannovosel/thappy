# Project Structure

## Overview

Thappy follows clean architecture principles with clear separation of concerns across layers. The project is organized as a monorepo containing both backend (Go) and frontend (React) applications.

## Repository Structure

```
thappy/
├── .github/workflows/          # CI/CD pipeline configuration
│   └── deploy.yml             # GitHub Actions deployment workflow
├── frontend/                  # React TypeScript application
│   ├── src/                   # Frontend source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── services/         # API client services
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions and constants
│   ├── public/               # Static assets
│   ├── Dockerfile            # Frontend container configuration (Caddy)
│   ├── Caddyfile            # Caddy web server configuration
│   └── package.json         # Frontend dependencies
├── backend/                  # Go application (root level)
│   ├── cmd/                  # Application entry points
│   ├── internal/             # Private application code
│   │   ├── domain/           # Domain entities and business logic
│   │   ├── repository/       # Data access layer
│   │   ├── service/          # Business service layer
│   │   ├── handler/          # HTTP handlers
│   │   ├── middleware/       # HTTP middleware
│   │   └── infrastructure/   # External dependencies
│   ├── migrations/           # Database migration files
│   ├── test/                 # Test utilities and scripts
│   └── go.mod               # Go module dependencies
├── docker-compose.yml        # Development environment
├── docker-compose.production.yml # Production environment
├── Makefile                  # Build and development commands
└── README.md                # Project documentation
```

## Backend Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer                           │
│  (handlers, middleware, routing)                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Service Layer                          │
│  (business logic, validation, orchestration)           │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                Repository Layer                         │
│  (data access, database operations)                     │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                 Domain Layer                            │
│  (entities, business rules, interfaces)                │
└─────────────────────────────────────────────────────────┘
```

### Directory Details

#### `/cmd/`
Application entry points and main functions.
- `cmd/server/main.go` - HTTP server entry point
- Dependency injection container setup
- Configuration loading

#### `/internal/domain/`
Core business entities and rules.
- `user/` - User entity with validation
- `therapy/` - Therapy type entities
- `article/` - Article content entities
- Pure business logic, no external dependencies

#### `/internal/service/`
Business service layer implementing use cases.
- Interface definitions for business operations
- Service implementations with business logic
- Integration between domain and repository layers

#### `/internal/repository/`
Data access layer.
- Interface definitions for data operations
- PostgreSQL implementations
- Database query logic and connection management

#### `/internal/handler/`
HTTP request handlers and REST API endpoints.
- Route definitions and HTTP method handlers
- Request/response transformation
- Integration with service layer

#### `/internal/middleware/`
HTTP middleware components.
- Authentication (JWT validation)
- CORS handling
- Logging and monitoring
- Rate limiting

#### `/internal/infrastructure/`
External service integrations.
- Database connection setup
- Configuration management
- External API clients

## Frontend Architecture

### Component Structure

```
src/
├── components/               # Reusable UI components
│   ├── common/              # Shared components (buttons, forms)
│   ├── layout/              # Layout components (header, footer)
│   └── therapy/             # Therapy-specific components
├── pages/                   # Route-level components
│   ├── Home/               # Homepage
│   ├── Therapies/          # Therapy listings
│   ├── Articles/           # Article content
│   └── Auth/               # Login/registration
├── services/               # API communication
│   ├── api.ts             # Base API client
│   ├── auth.ts            # Authentication service
│   ├── therapy.ts         # Therapy data service
│   └── article.ts         # Article data service
├── types/                 # TypeScript definitions
│   ├── api.ts            # API response types
│   └── auth.ts           # Authentication types
├── utils/                # Utility functions
│   ├── constants.ts      # App constants and config
│   ├── helpers.ts        # Helper functions
│   └── validation.ts     # Form validation
└── hooks/               # Custom React hooks
    ├── useAuth.ts       # Authentication hook
    └── useApi.ts        # API communication hook
```

## Database Schema

### Core Tables

```sql
-- User management
users (id, email, password_hash, role, created_at, updated_at)
client_profiles (user_id, first_name, last_name, phone, date_of_birth)
therapist_profiles (user_id, first_name, last_name, bio, license_number, accepting_clients)

-- Content management
therapies (id, title, description, icon, is_active)
articles (id, title, content, category, published, created_at)
therapist_specializations (therapist_id, therapy_id)
```

### Migration System
- Sequential numbered migrations in `/migrations/`
- Up/down migration support
- Automatic application during deployment
- Version tracking in database

## Deployment Architecture

### Containerization

```
Production Environment:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Caddy)       │    │     (Go)        │    │ (PostgreSQL)    │
│   Port: 80      │    │   Port: 8081    │    │  Port: 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    Docker Network: thappy-network-prod
```

### Service Communication
- **Frontend → Backend**: HTTP API calls via Caddy proxy
- **Backend → Database**: PostgreSQL connection with pooling
- **External**: Only port 80 (frontend) exposed to internet

## Configuration Management

### Environment Files
- `.env.development` - Local development settings
- `.env.production` - Production settings (generated by CI/CD)
- `.env.example` - Template with default values

### Configuration Sources
1. Environment variables (highest priority)
2. `.env` files
3. Default values in code
4. GitHub Secrets (for CI/CD)

## Testing Strategy

### Backend Testing
- Unit tests for domain layer
- Integration tests for repositories
- API tests for handlers
- Test coverage reporting

### Frontend Testing
- Component unit tests with React Testing Library
- Integration tests for API services
- End-to-end testing capabilities

### CI/CD Testing
- Automated test execution on every push
- Test results must pass before deployment
- Integration testing in production environment

## Security Architecture

### Authentication Flow
```
Client → Frontend → Caddy Proxy → Backend → JWT Validation → Database
   ↓         ↓           ↓           ↓            ↓           ↓
 UI/UX   API Calls   CORS/Headers  Auth Logic  Token Check  User Data
```

### Security Layers
1. **Network**: Firewall rules, internal Docker network
2. **Transport**: HTTPS ready (currently HTTP for simplicity)
3. **Application**: JWT tokens, bcrypt password hashing
4. **Data**: PostgreSQL with parameterized queries

## Development Workflow

### Local Development
1. `make dev` - Start all services with Docker Compose
2. Backend: http://localhost:8081
3. Frontend: http://localhost:3004
4. Database: localhost:5433

### Production Deployment
1. Push to main branch
2. GitHub Actions triggers
3. Tests run automatically
4. Docker images built
5. Deployed to Digital Ocean
6. Health checks verify deployment

## Monitoring and Observability

### Health Checks
- Frontend: `/health` endpoint
- Backend: `/health` with database connectivity
- Database: Connection pool monitoring

### Logging
- Structured JSON logging in production
- Console logging in development
- Docker log aggregation

### Metrics
- HTTP request/response logging
- Database connection metrics
- Error tracking and reporting

## Future Architecture Considerations

### Scalability
- Horizontal scaling with load balancer
- Database read replicas
- CDN for static assets
- Kubernetes migration path

### Reliability
- Database backup automation
- Service redundancy
- Monitoring and alerting
- Disaster recovery procedures

### Performance
- API response caching
- Database query optimization
- Frontend bundle optimization
- Image and asset optimization
