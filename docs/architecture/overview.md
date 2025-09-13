# Architecture Overview

High-level system architecture and design principles for the Thappy Authentication API.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Layer                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Middleware    │    Handlers     │         HTTP Utils          │
│   (Auth/CORS)   │   (User/Auth)   │   (Response/Error)          │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  User Service   │  Auth Service   │    Token Service            │
│   (Business)    │ (Authentication)│    (JWT/Simple)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Domain Layer                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Entities      │   Interfaces    │     Business Rules          │
│   (User)        │ (Repository)    │     (Validation)            │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Repository Layer                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ User Repository │   PostgreSQL    │      Migrations             │
│  (Interface)    │  (Implementation)│     (Schema)               │
└─────────────────┴─────────────────┴─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Database      │   Messaging     │     Configuration           │
│ (PostgreSQL)    │  (RabbitMQ)     │     (Config Service)        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Component Interaction

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │────│  HTTP API   │────│ Middleware  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                 │
                           ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Handlers   │────│  Services   │────│  Domain     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                 │
                           ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Repository   │────│ PostgreSQL  │    │ RabbitMQ    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Design Principles

### 1. Clean Architecture

**Dependency Direction**: Outer layers depend on inner layers, never the reverse.

```
UI → Controllers → Use Cases → Entities
```

- **Domain Layer** (Center): Contains business rules and entities
- **Service Layer**: Contains application business logic
- **Interface Layer**: Contains controllers, presenters, and gateways
- **Infrastructure Layer**: Contains frameworks, databases, and external agencies

### 2. Domain-Driven Design (DDD)

**Entity-Based Organization**: Code is organized around business entities.

```
internal/
├── domain/user/           # User aggregate
│   ├── entity.go         # User entity
│   ├── repository.go     # Repository interface
│   └── service.go        # Service interface
├── service/user/         # User business logic
├── repository/user/      # User data access
└── handler/user/         # User HTTP handlers
```

### 3. Dependency Injection

**Container Pattern**: All dependencies are injected through a central container.

```go
type Container struct {
    Config         *config.Config
    DB             *pgxpool.Pool
    UserService    user.UserService
    TokenService   user.TokenService
    UserRepository user.UserRepository
    UserHandler    *userHandler.Handler
}
```

### 4. Interface Segregation

**Small, Focused Interfaces**: Each interface has a single responsibility.

```go
// Repository interface
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    GetByEmail(ctx context.Context, email string) (*User, error)
    GetByID(ctx context.Context, id string) (*User, error)
}

// Service interface
type UserService interface {
    Register(ctx context.Context, email, password string) (*User, error)
    Login(ctx context.Context, email, password string) (string, error)
}
```

## Layer Responsibilities

### 1. Domain Layer (`internal/domain/`)

**Purpose**: Contains core business logic and rules.

**Responsibilities**:
- Define business entities and their behavior
- Define repository and service interfaces
- Implement domain validation rules
- No dependencies on external frameworks

**Example**:
```go
// User entity with business logic
type User struct {
    ID           string
    Email        string
    PasswordHash string
    CreatedAt    time.Time
    UpdatedAt    time.Time
}

func (u *User) ValidatePassword(password string) bool {
    return bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) == nil
}
```

### 2. Service Layer (`internal/service/`)

**Purpose**: Implements application business logic and orchestrates domain objects.

**Responsibilities**:
- Coordinate between domain objects and repositories
- Implement application-specific business rules
- Handle transactions and external service calls
- Transform data between layers

**Example**:
```go
type UserService struct {
    repo         UserRepository
    tokenService TokenService
}

func (s *UserService) Register(ctx context.Context, email, password string) (*User, error) {
    // Business logic: check if user exists, create user, generate token
    user, err := NewUser(email, password)
    if err != nil {
        return nil, err
    }
    
    return s.repo.Create(ctx, user)
}
```

### 3. Repository Layer (`internal/repository/`)

**Purpose**: Provides data access abstraction.

**Responsibilities**:
- Implement data persistence operations
- Abstract database-specific details
- Handle data mapping and queries
- Implement repository interfaces from domain

**Example**:
```go
type UserRepository struct {
    db *pgxpool.Pool
}

func (r *UserRepository) Create(ctx context.Context, user *User) error {
    query := `INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`
    _, err := r.db.Exec(ctx, query, user.ID, user.Email, user.PasswordHash, user.CreatedAt, user.UpdatedAt)
    return err
}
```

### 4. Handler Layer (`internal/handler/`)

**Purpose**: Handles HTTP requests and responses.

**Responsibilities**:
- Parse HTTP requests
- Validate request data
- Call appropriate services
- Format HTTP responses
- Handle HTTP-specific concerns (status codes, headers)

**Example**:
```go
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
    var req RegisterRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.writeErrorResponse(w, http.StatusBadRequest, "Invalid JSON format")
        return
    }
    
    user, err := h.userService.Register(r.Context(), req.Email, req.Password)
    if err != nil {
        h.handleServiceError(w, err)
        return
    }
    
    h.writeSuccessResponse(w, http.StatusCreated, RegisterResponse{
        User:    ToUserResponse(user),
        Message: "User registered successfully",
    })
}
```

### 5. Infrastructure Layer (`internal/infrastructure/`)

**Purpose**: Provides external integrations and configuration.

**Responsibilities**:
- Database connections and configuration
- Message queue setup
- Configuration management
- External service integrations
- Dependency injection container

## Data Flow

### Request Flow

```
1. HTTP Request → Middleware → Handler
2. Handler → Service
3. Service → Domain Validation
4. Service → Repository
5. Repository → Database
6. Database → Repository → Service → Handler
7. Handler → HTTP Response
```

### Example: User Registration Flow

```
POST /api/register
│
├─ 1. Middleware (CORS, JSON validation)
├─ 2. Handler.Register()
│   ├─ Parse request
│   ├─ Validate input
│   └─ Call UserService.Register()
│
├─ 3. UserService.Register()
│   ├─ Create User entity (domain validation)
│   ├─ Check for existing user
│   └─ Call Repository.Create()
│
├─ 4. Repository.Create()
│   ├─ Execute SQL INSERT
│   └─ Handle database errors
│
└─ 5. Response
    ├─ Success: 201 Created + User data
    └─ Error: 400/409 + Error message
```

## Security Architecture

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   API       │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
   1.  │ POST /api/login   │                   │
       │ {email,password}  │                   │
       │──────────────────→│                   │
       │                   │                   │
   2.  │                   │ SELECT user       │
       │                   │ WHERE email=?     │
       │                   │──────────────────→│
       │                   │                   │
   3.  │                   │ User data         │
       │                   │←──────────────────│
       │                   │                   │
   4.  │                   │ Verify password   │
       │                   │ (bcrypt.Compare)  │
       │                   │                   │
   5.  │ JWT Token +       │                   │
       │ User data         │                   │
       │←──────────────────│                   │
       │                   │                   │
   6.  │ Protected request │                   │
       │ Authorization:    │                   │
       │ Bearer <token>    │                   │
       │──────────────────→│                   │
       │                   │                   │
   7.  │                   │ Validate token    │
       │                   │ Extract user ID   │
       │                   │                   │
   8.  │ Protected data    │                   │
       │←──────────────────│                   │
```

### Security Layers

1. **Transport Security**: HTTPS in production
2. **Authentication**: JWT tokens with HMAC-SHA256
3. **Authorization**: Middleware validates tokens and user existence
4. **Input Validation**: Request validation at handler level
5. **Password Security**: bcrypt hashing with configurable cost
6. **Database Security**: Parameterized queries to prevent SQL injection

## Configuration Architecture

### Environment-Based Configuration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  .env.example   │    │     .env        │    │ docker-compose  │
│   (Template)    │    │   (Local)       │    │   (Override)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │ Config Service  │
                    │ (Validation &   │
                    │  Type Safety)   │
                    └─────────────────┘
                                 │
                                 ▼
                    ┌─────────────────┐
                    │  Application    │
                    │ (Typed Config   │
                    │   Structs)      │
                    └─────────────────┘
```

### Configuration Priority

1. **Environment Variables** (highest priority)
2. **Docker Compose Environment**
3. **`.env` file**
4. **Default values** (lowest priority)

## Error Handling Architecture

### Error Flow

```
Database Error → Repository → Service → Handler → HTTP Response
     │              │           │          │           │
     └─ SQL Error    └─ Domain   └─ App    └─ HTTP    └─ JSON
                        Error      Error     Error      Error
```

### Error Types

1. **Domain Errors**: Business rule violations
2. **Service Errors**: Application logic errors  
3. **Repository Errors**: Data access errors
4. **HTTP Errors**: Request/response errors

### Error Handling Strategy

```go
// Domain errors
var (
    ErrUserNotFound      = errors.New("user not found")
    ErrUserAlreadyExists = errors.New("user already exists")
    ErrTokenInvalid      = errors.New("invalid token")
    ErrTokenExpired      = errors.New("token expired")
)

// Error handling in handlers
func (h *Handler) handleServiceError(w http.ResponseWriter, err error) {
    switch {
    case errors.Is(err, user.ErrUserNotFound):
        h.writeErrorResponse(w, http.StatusNotFound, "User not found")
    case errors.Is(err, user.ErrUserAlreadyExists):
        h.writeErrorResponse(w, http.StatusConflict, "User already exists")
    default:
        h.writeErrorResponse(w, http.StatusInternalServerError, "Internal server error")
    }
}
```

## Testing Architecture

### Testing Pyramid

```
                    ┌──────────┐
                    │    E2E   │  ← API Tests (curl scripts)
                    │   Tests  │
                 ┌──┴──────────┴──┐
                 │  Integration   │  ← Repository tests with DB
                 │     Tests      │
              ┌──┴────────────────┴──┐
              │     Unit Tests       │  ← Domain, Service, Handler tests
              │  (Isolated, Mocked)  │
           ┌──┴──────────────────────┴──┐
           │        Static Analysis      │  ← Linting, Formatting
           │     (Lint, Format, Vet)     │
           └─────────────────────────────┘
```

### Test Strategy

- **Unit Tests**: Fast, isolated, mocked dependencies
- **Integration Tests**: Real database, test data isolation
- **API Tests**: Full HTTP request/response cycle
- **Contract Tests**: Interface compatibility

## Future Architecture Considerations

### Scalability

1. **Horizontal Scaling**: Stateless API design enables load balancing
2. **Database Scaling**: Read replicas, connection pooling
3. **Caching**: Redis for session management, query caching
4. **Message Queues**: Async processing with RabbitMQ

### Observability

1. **Logging**: Structured logging with correlation IDs
2. **Metrics**: Prometheus metrics for monitoring
3. **Tracing**: Distributed tracing with OpenTelemetry
4. **Health Checks**: Comprehensive health monitoring

### Security Enhancements

1. **Rate Limiting**: Protect against abuse
2. **Input Sanitization**: Prevent injection attacks
3. **Audit Logging**: Track security-relevant events
4. **Secret Management**: External secret storage

### Microservices Evolution

Current monolithic structure can evolve:

```
Current: Single API
   ↓
Future: 
├── User Service (Authentication)
├── Profile Service (User Management)
├── Notification Service (Messages)
└── Gateway Service (API Gateway)
```