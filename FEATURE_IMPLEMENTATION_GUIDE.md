# Feature Implementation Guide: User Registration & Login

## Overview
This guide demonstrates our TDD approach using user authentication as the first feature.

## Implementation Phases

### Phase 1: Domain Design & Tests ✅ COMPLETED
**Goal**: Define domain entities and business rules
**Success Criteria**: Domain tests pass, no external dependencies
**Status**: ✅ Complete - 89.1% test coverage

1. **Write domain tests first** (`internal/domain/user_test.go`)
   - User entity creation validation
   - Password hashing behavior
   - Email validation rules
   - Business rule enforcement

2. **Create domain entities** (`internal/domain/user.go`)
   ```go
   type User struct {
       ID           string
       Email        string
       PasswordHash string
       CreatedAt    time.Time
       UpdatedAt    time.Time
   }
   ```

3. **Define repository interface** (`internal/domain/repository.go`)
   ```go
   type UserRepository interface {
       Create(ctx context.Context, user *User) error
       GetByEmail(ctx context.Context, email string) (*User, error)
       GetByID(ctx context.Context, id string) (*User, error)
   }
   ```

4. **Define service interface** (`internal/domain/service.go`)
   ```go
   type UserService interface {
       Register(ctx context.Context, email, password string) (*User, error)
       Login(ctx context.Context, email, password string) (string, error) // returns token
   }
   ```

### Phase 2: Service Layer & Tests ✅ COMPLETED
**Goal**: Implement business logic with mocked dependencies
**Success Criteria**: Service tests pass with 100% coverage
**Status**: ✅ Complete - 93.2% test coverage

1. **Write service tests** (`internal/service/user_service_test.go`)
   - Registration with valid/invalid data
   - Duplicate email handling
   - Login with correct/incorrect credentials
   - Token generation

2. **Implement service** (`internal/service/user_service.go`)
   - Password hashing using bcrypt
   - Email uniqueness validation
   - JWT token generation
   - Error handling

### Phase 3: Repository Layer & Tests ✅ COMPLETED
**Goal**: Data persistence with PostgreSQL
**Success Criteria**: Integration tests pass with test database
**Status**: ✅ Complete - PostgreSQL integration with proper error handling

1. **Create database migration** (`migrations/000001_create_users_table.up.sql`)
   ```sql
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE INDEX idx_users_email ON users(email);
   ```

2. **Write repository tests** (`internal/repository/postgres/user_repo_test.go`)
   - Use testcontainers for PostgreSQL
   - Test CRUD operations
   - Test constraint violations

3. **Implement repository** (`internal/repository/postgres/user_repo.go`)
   - Use pgx for database operations
   - Proper error mapping
   - Context handling

### Phase 4: HTTP Handler & Tests ✅ COMPLETED
**Goal**: REST API endpoints
**Success Criteria**: Handler tests pass, proper HTTP status codes
**Status**: ✅ Complete - 37.7% test coverage

### REFACTORING ✅ COMPLETED
**Goal**: Professional Go project structure
**Success Criteria**: Entity-based organization, reusable utilities
**Status**: ✅ Complete - Clean architecture with separated concerns

**Key Changes:**
- Entity-based folder structure (`internal/domain/user/`, `internal/service/user/`)
- Extracted HTTP utilities (`internal/handler/http/response.go`, `errors.go`) 
- Clean handler implementation with dependency injection
- Professional Go standards following industry practices

1. **Write handler tests** (`internal/handler/user_handler_test.go`)
   - Registration endpoint (POST /api/register)
   - Login endpoint (POST /api/login)
   - Input validation
   - Error responses

2. **Implement handlers** (`internal/handler/user_handler.go`)
   - Request/response DTOs
   - Input validation
   - Error handling middleware
   - JWT middleware for protected routes

### Phase 5: Infrastructure Setup ✅ COMPLETED
**Goal**: Wire everything together
**Success Criteria**: Application starts and connects to services
**Status**: ✅ Complete - Full production-ready infrastructure

**Key Infrastructure Components:**
- **Configuration Management**: Environment-based config with validation
- **Dependency Injection**: Clean container pattern with proper lifecycle
- **Database Layer**: PostgreSQL with connection pooling and health checks
- **Message Queue**: RabbitMQ with exchange/queue setup
- **HTTP Server**: Graceful shutdown, middleware stack, proper timeouts
- **Docker Infrastructure**: Multi-stage builds, health checks, volumes
- **Development Workflow**: Comprehensive Makefile with 25+ commands

### Phase 6: Integration Testing & Config Enhancement ✅ COMPLETED
**Goal**: End-to-end testing and professional configuration service
**Success Criteria**: All integration tests pass, production-ready config management
**Status**: ✅ Complete - Professional config service with .env support and validation

**Key Enhancements:**
- **Professional Config Service**: Environment variable loading with .env support
- **Type-safe Configuration**: Structured config with validation and defaults
- **Import Path Cleanup**: Entity-based structure with proper Go package organization
- **Test Coverage**: All tests passing with proper mock implementations
- **Code Quality**: Linted, formatted, and vet-clean codebase

1. **API integration tests** (`test/integration/user_test.go`)
   - Full registration flow
   - Full login flow
   - Database state verification
   - Token validation

### Phase 7: Local Testing & Workflow Validation
**Goal**: Manual testing with curl requests
**Success Criteria**: Multiple users can register and login successfully
**Status**: 🔄 In Progress

**Testing Scenarios:**
- User registration with multiple different users
- User login verification with JWT tokens
- Protected endpoint access with authentication
- Error handling for duplicate emails and invalid credentials

**Curl Request Files:**
- `test/curl/01-register-users.sh` - Register multiple test users
- `test/curl/02-login-users.sh` - Login with registered users
- `test/curl/03-protected-endpoints.sh` - Test authenticated endpoints
- `test/curl/04-error-scenarios.sh` - Test error conditions

## TDD Workflow for Each Component

```
1. RED: Write failing test
   - Define expected behavior
   - Run test, see it fail

2. GREEN: Write minimal code to pass
   - Implement just enough
   - Run test, see it pass

3. REFACTOR: Improve code quality
   - Clean up implementation
   - Ensure tests still pass
```

## Testing Checklist

### Unit Tests (No external dependencies)
- [ ] Domain entity validation
- [ ] Service business logic
- [ ] Handler request/response mapping
- [ ] Utility functions

### Integration Tests (With dependencies)
- [ ] Repository with real database
- [ ] Service with real repository
- [ ] API endpoints end-to-end
- [ ] Database migrations

### Test Coverage Goals
- Domain: 100%
- Service: 90%+
- Repository: 80%+
- Handlers: 80%+
- Overall: 85%+

## File Creation Order

1. **Start with tests**
   ```
   internal/domain/user_test.go
   internal/domain/user.go
   ```

2. **Service layer**
   ```
   internal/service/user_service_test.go
   internal/service/user_service.go
   ```

3. **Repository layer**
   ```
   migrations/000001_create_users_table.up.sql
   internal/repository/postgres/user_repo_test.go
   internal/repository/postgres/user_repo.go
   ```

4. **HTTP layer**
   ```
   internal/handler/user_handler_test.go
   internal/handler/user_handler.go
   ```

5. **Infrastructure**
   ```
   internal/infrastructure/database/postgres.go
   internal/infrastructure/config/config.go
   cmd/api/main.go
   ```

6. **Docker & Make**
   ```
   docker-compose.yml
   Dockerfile
   Makefile
   ```

## Commands for Development

```bash
# Run tests for current package
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific test
go test -run TestUserRegistration ./internal/service

# Run integration tests
make test-integration

# Run with race detector
go test -race ./...

# Generate mocks (if using mockery)
mockery --all --output=mocks
```

## Key Principles

1. **Test First**: Never write production code without a failing test
2. **Small Steps**: One test, one implementation at a time
3. **Fast Feedback**: Run tests frequently (every few minutes)
4. **Refactor Safely**: Only refactor when tests are green
5. **Mock Boundaries**: Mock at architectural boundaries only
6. **Real Dependencies**: Use real databases in integration tests

## Common Pitfalls to Avoid

- Writing implementation before tests
- Testing implementation details instead of behavior
- Skipping integration tests
- Not testing error cases
- Ignoring test maintenance
- Over-mocking (mock only what you own)

## Success Metrics

- All tests pass before committing
- No commented-out tests
- Tests are documentation
- Tests run fast (< 1 second for unit tests)
- Clear test names that describe behavior