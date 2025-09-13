# Project Structure

```
thappy/
│
├── cmd/
│   └── api/
│       └── main.go                 # Application entry point
│
├── internal/                       # Private application code
│   ├── domain/                     # Core business logic & entities
│   │   ├── entity.go              # Domain entities
│   │   ├── repository.go          # Repository interfaces
│   │   └── service.go             # Service interfaces
│   │
│   ├── handler/                    # HTTP handlers (presentation layer)
│   │   ├── health.go              # Health check endpoints
│   │   ├── middleware.go          # HTTP middleware
│   │   └── routes.go              # Route definitions
│   │
│   ├── service/                    # Business logic implementation
│   │   └── [feature]_service.go   # Service implementations
│   │
│   ├── repository/                 # Data access layer
│   │   └── postgres/              # PostgreSQL implementations
│   │       └── [entity]_repo.go
│   │
│   └── infrastructure/            # External services & config
│       ├── config/
│       │   └── config.go          # Configuration management
│       ├── database/
│       │   └── postgres.go        # Database connection & setup
│       └── messaging/
│           └── rabbitmq.go        # RabbitMQ connection & setup
│
├── pkg/                           # Public packages (can be imported by external projects)
│   ├── logger/                    # Structured logging
│   └── validator/                 # Input validation helpers
│
├── migrations/                    # Database migrations
│   ├── 000001_init_schema.up.sql
│   └── 000001_init_schema.down.sql
│
├── test/
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test data
│
├── scripts/                      # Utility scripts
│   ├── migrate.sh               # Database migration script
│   └── seed.sh                  # Database seeding script
│
├── docs/                        # Documentation
│   └── api/                     # API documentation
│
├── .github/
│   └── workflows/              # GitHub Actions
│       └── ci.yml
│
├── docker-compose.yml          # Local development environment
├── Dockerfile                  # Container image definition
├── Makefile                   # Common tasks
├── go.mod                     # Go dependencies
├── go.sum                     # Dependency checksums
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── .golangci.yml             # Linter configuration
└── README.md                 # Project documentation
```

## Layer Responsibilities

### Domain Layer (`/internal/domain`)
- Pure business logic
- Domain entities and value objects
- Repository and service interfaces
- No external dependencies

### Application Layer (`/internal/service`)
- Implements domain service interfaces
- Orchestrates use cases
- Transaction management
- Business rule validation

### Infrastructure Layer (`/internal/infrastructure`)
- External service integrations
- Database connections
- Message queue setup
- Configuration loading

### Presentation Layer (`/internal/handler`)
- HTTP request/response handling
- Input validation and sanitization
- Error response formatting
- Authentication/authorization middleware

### Repository Layer (`/internal/repository`)
- Data persistence logic
- Query building
- Data mapping between domain and database

## Key Principles

1. **Dependency Rule**: Dependencies point inward (handlers → service → domain)
2. **Interface Segregation**: Small, focused interfaces
3. **Dependency Injection**: Pass dependencies explicitly
4. **Testability**: Each layer can be tested independently
5. **No Circular Dependencies**: Clear, one-way dependency flow