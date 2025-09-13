# Testing Guide

Comprehensive guide to testing in the Thappy project, following Test-Driven Development (TDD) principles.

## Testing Philosophy

We follow **Test-Driven Development (TDD)** with the RED-GREEN-REFACTOR cycle:

1. **RED**: Write a failing test
2. **GREEN**: Write minimal code to make it pass
3. **REFACTOR**: Improve code while keeping tests green

## Test Types

### 1. Unit Tests
Test individual components in isolation with mocked dependencies.

**Coverage Goals:**
- Domain Layer: 100%
- Service Layer: 90%+
- Repository Layer: 80%+
- Handler Layer: 80%+

### 2. Integration Tests
Test components working together with real dependencies.

### 3. API Tests
End-to-end testing of HTTP endpoints using curl scripts.

## Running Tests

### Quick Commands

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Run specific package
go test ./internal/domain/user -v

# Run with race detection
go test -race ./...

# Run only unit tests (skip integration)
go test -short ./...
```

### Detailed Test Commands

```bash
# Verbose output with test names
go test -v ./...

# Run specific test function
go test -run TestUserValidation ./internal/domain/user

# Run tests with coverage and generate HTML report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# Benchmark tests
go test -bench=. ./...

# Profile memory usage
go test -memprofile=mem.prof ./...
```

## Unit Tests

### Domain Layer Tests

Location: `internal/domain/user/entity_test.go`

**Coverage: 89.1%**

Tests user entity validation, password hashing, and business rules.

```go
func TestNewUser(t *testing.T) {
    tests := []struct {
        name        string
        email       string
        password    string
        shouldError bool
        errorMsg    string
    }{
        {
            name:        "valid user",
            email:       "test@example.com",
            password:    "ValidPass123!",
            shouldError: false,
        },
        // ... more test cases
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            user, err := NewUser(tt.email, tt.password)
            // ... assertions
        })
    }
}
```

### Service Layer Tests

Location: `internal/service/user/user_test.go`

**Coverage: 93.2%**

Tests business logic with mocked repositories and external dependencies.

```go
type MockUserRepository struct {
    users          map[string]*userDomain.User
    shouldFailNext bool
    failError      error
}

func TestUserService_Register(t *testing.T) {
    repo := NewMockUserRepository()
    tokenService := NewMockTokenService()
    service := NewUserService(repo, tokenService)
    
    // Test successful registration
    user, err := service.Register(context.Background(), "test@example.com", "ValidPass123!")
    assert.NoError(t, err)
    assert.NotNil(t, user)
}
```

### Repository Layer Tests

Location: `internal/repository/user/postgres/user_repo_integration_test.go.disabled`

**Note**: Integration tests are currently disabled due to Docker setup complexity.

```go
func TestUserRepository_Integration(t *testing.T) {
    if testing.Short() {
        t.Skip("Skipping integration test")
    }
    
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)
    
    repo := NewUserRepository(db)
    
    // Test CRUD operations
    // ...
}
```

### Handler Layer Tests

Location: `internal/handler/user_handler_test.go`

Tests HTTP handlers with mocked services.

```go
func TestUserHandler_Register(t *testing.T) {
    service := NewMockUserService()
    handler := NewHandler(service)
    
    reqBody := `{"email":"test@example.com","password":"ValidPass123!"}`
    req := httptest.NewRequest("POST", "/api/register", strings.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")
    
    w := httptest.NewRecorder()
    handler.Register(w, req)
    
    assert.Equal(t, http.StatusCreated, w.Code)
}
```

## API Tests

### Test Scripts

Located in `test/curl/`:

1. **`01-register-users.sh`** - User registration tests
2. **`02-login-users.sh`** - Login and authentication tests  
3. **`03-protected-endpoints.sh`** - Protected endpoint tests
4. **`04-error-scenarios.sh`** - Error handling tests
5. **`run-all-tests.sh`** - Master test runner

### Running API Tests

```bash
# Run complete test suite
./test/curl/run-all-tests.sh

# Run individual test suites
./test/curl/01-register-users.sh
./test/curl/02-login-users.sh
./test/curl/03-protected-endpoints.sh
./test/curl/04-error-scenarios.sh
```

### Test Output Example

```bash
=== User Registration Tests ===
Testing API at http://localhost:8080

1. Valid user registrations:
✓ Testing: Alice - Valid user (201)
✓ Testing: Bob - Valid user (201)
✓ Testing: Charlie - Valid user (201)

2. Invalid registration attempts:
✓ Testing: Alice - Duplicate email (409)
✓ Testing: Invalid email format (400)
✓ Testing: Password too short (400)
```

### Test Data

The API tests create these test users:
- `alice@example.com` (password: `SecurePass123!`)
- `bob@example.com` (password: `MyPassword456!`)
- `charlie@example.com` (password: `SuperSecret789!`)

Tokens are saved in `test/curl/tokens.txt` for use in protected endpoint tests.

## Test Organization

### File Naming Conventions

- `*_test.go` - Unit tests
- `*_integration_test.go` - Integration tests
- `*_benchmark_test.go` - Benchmark tests

### Test Function Naming

```go
// Format: TestFunctionName_Scenario
func TestUserService_Register_ValidInput(t *testing.T)
func TestUserService_Register_DuplicateEmail(t *testing.T)
func TestUserService_Login_InvalidCredentials(t *testing.T)
```

### Test Structure

```go
func TestFunction_Scenario(t *testing.T) {
    // Arrange
    // Setup test data and mocks
    
    // Act
    // Call the function being tested
    
    // Assert
    // Verify the results
}
```

## Mocking

### Mock Interfaces

We create mocks for external dependencies:

```go
// Mock repository
type MockUserRepository struct {
    users map[string]*userDomain.User
}

func (m *MockUserRepository) Create(ctx context.Context, user *userDomain.User) error {
    m.users[user.ID] = user
    return nil
}

// Mock token service
type MockTokenService struct {
    tokens map[string]string
}

func (m *MockTokenService) GenerateToken(userID string) (string, error) {
    token := fmt.Sprintf("mock_token_%s", userID)
    m.tokens[token] = userID
    return token, nil
}
```

### Mock Setup Patterns

```go
func setupMockService() (*MockUserRepository, *MockTokenService, *UserService) {
    repo := NewMockUserRepository()
    tokenService := NewMockTokenService()
    service := NewUserService(repo, tokenService)
    return repo, tokenService, service
}
```

## Test Data Management

### Test User Factory

```go
func CreateTestUser(email, password string) *User {
    user, err := NewUser(email, password)
    if err != nil {
        panic(fmt.Sprintf("Failed to create test user: %v", err))
    }
    return user
}
```

### Common Test Data

```go
var (
    ValidEmail    = "test@example.com"
    ValidPassword = "ValidPass123!"
    InvalidEmail  = "invalid-email"
    WeakPassword  = "weak"
)
```

## Coverage Analysis

### Current Coverage

```bash
# Generate coverage report
make test-coverage

# View coverage in browser
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Coverage by Package

| Package | Coverage | Status |
|---------|----------|--------|
| `internal/domain/user` | 89.1% | ✅ Good |
| `internal/service/user` | 93.2% | ✅ Excellent |
| `internal/service/auth` | 85%+ | ✅ Good |
| `internal/repository/user/postgres` | 80%+ | ✅ Good |
| `internal/handler/user` | 75%+ | ⚠️ Needs improvement |

### Coverage Goals

- **Domain Layer**: 100% (business logic must be fully tested)
- **Service Layer**: 90%+ (critical business processes)
- **Repository Layer**: 80%+ (data access patterns)
- **Handler Layer**: 80%+ (HTTP request/response handling)

## Continuous Integration

### Pre-commit Checks

```bash
# Run before committing
make test
make lint
make format
./test/curl/run-all-tests.sh
```

### CI Pipeline (Future)

```yaml
# .github/workflows/test.yml (example)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-go@v2
        with:
          go-version: 1.24
      - run: make test
      - run: make lint
      - run: ./test/curl/run-all-tests.sh
```

## Performance Testing

### Benchmark Tests

```go
func BenchmarkPasswordHashing(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _, err := hashPassword("TestPassword123!")
        if err != nil {
            b.Fatal(err)
        }
    }
}
```

### Load Testing

```bash
# Example with Apache Bench
ab -n 1000 -c 10 -T application/json -p register.json http://localhost:8080/api/register

# Example with curl and GNU parallel
seq 1 100 | parallel -j 10 curl -s -X POST -H "Content-Type: application/json" -d '{"email":"user{}@example.com","password":"Test123!"}' http://localhost:8080/api/register
```

## Testing Best Practices

### Do's

1. **Write tests first** (TDD approach)
2. **Test behavior, not implementation**
3. **Use descriptive test names**
4. **Keep tests independent**
5. **Use table-driven tests for multiple scenarios**
6. **Mock external dependencies**
7. **Test edge cases and error conditions**

### Don'ts

1. **Don't test private methods directly**
2. **Don't create tests that depend on other tests**
3. **Don't ignore test failures**
4. **Don't test third-party code**
5. **Don't write tests without assertions**

### Example: Good Test Structure

```go
func TestUserService_Register(t *testing.T) {
    tests := []struct {
        name        string
        email       string
        password    string
        setupMock   func(*MockUserRepository)
        expectError bool
        errorMsg    string
    }{
        {
            name:     "successful registration",
            email:    "test@example.com",
            password: "ValidPass123!",
            setupMock: func(repo *MockUserRepository) {
                // No special setup needed
            },
            expectError: false,
        },
        {
            name:     "duplicate email",
            email:    "existing@example.com",
            password: "ValidPass123!",
            setupMock: func(repo *MockUserRepository) {
                repo.users["existing@example.com"] = &userDomain.User{
                    Email: "existing@example.com",
                }
            },
            expectError: true,
            errorMsg:    "user already exists",
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Arrange
            repo := NewMockUserRepository()
            tokenService := NewMockTokenService()
            service := NewUserService(repo, tokenService)
            tt.setupMock(repo)

            // Act
            user, err := service.Register(context.Background(), tt.email, tt.password)

            // Assert
            if tt.expectError {
                assert.Error(t, err)
                assert.Contains(t, err.Error(), tt.errorMsg)
                assert.Nil(t, user)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, user)
                assert.Equal(t, tt.email, user.Email)
            }
        })
    }
}
```

## Troubleshooting Tests

### Common Issues

1. **Tests failing intermittently**
   - Check for race conditions: `go test -race ./...`
   - Ensure tests are independent
   - Check for shared state between tests

2. **Low coverage**
   - Use `go test -cover ./...` to identify untested code
   - Add tests for error paths and edge cases
   - Consider if untested code is actually needed

3. **Slow tests**
   - Profile test execution: `go test -cpuprofile=cpu.prof ./...`
   - Reduce external dependencies in unit tests
   - Use `testing.Short()` to skip slow tests during development

4. **API tests failing**
   - Ensure API is running: `curl http://localhost:8080/health`
   - Check Docker services: `docker-compose ps`
   - Clear test artifacts: `rm -f test/curl/tokens.txt`

### Debugging Tests

```bash
# Run specific test with verbose output
go test -v -run TestUserService_Register ./internal/service/user

# Run with detailed failure output
go test -v -failfast ./...

# Debug with delve
dlv test ./internal/service/user -- -test.run TestUserService_Register
```