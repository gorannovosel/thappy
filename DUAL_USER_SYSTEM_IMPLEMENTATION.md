# Dual User System Implementation Plan

## Overview
Extend the existing user authentication system to support both clients and therapists with role-based access control, following TDD principles and clean architecture patterns.

## Stage 1: Domain Layer - Core Entities and Validation
**Goal**: Extend User entity with roles and create profile entities
**Success Criteria**:
- User entity supports roles (client/therapist)
- ClientProfile and TherapistProfile entities with validation
- All domain tests pass
**Tests**: Entity validation, role assignment, profile creation
**Status**: Complete

### Implementation Tasks:
1. **Extend User entity** (`internal/domain/user/entity.go`):
   - Add `Role` field (UserRole enum)
   - Add `IsActive` field
   - Update `NewUser()` to accept role parameter
   - Add role validation methods

2. **Create ClientProfile entity** (`internal/domain/client/entity.go`):
   - Core fields: UserID, FirstName, LastName, etc.
   - Validation methods for required fields
   - Therapist assignment logic

3. **Create TherapistProfile entity** (`internal/domain/therapist/entity.go`):
   - Core fields: UserID, FirstName, LastName, LicenseNumber, etc.
   - License validation
   - Specializations management

4. **Tests to Write**:
   - `internal/domain/user/entity_test.go` - Role validation
   - `internal/domain/client/entity_test.go` - Client profile validation
   - `internal/domain/therapist/entity_test.go` - Therapist profile validation

## Stage 2: Repository Layer - Data Access
**Goal**: Implement repository interfaces and PostgreSQL implementations
**Success Criteria**:
- Repository interfaces for Client and Therapist profiles
- PostgreSQL implementations with proper queries
- Repository integration tests pass
**Tests**: CRUD operations, constraint validation, relationship queries
**Status**: Complete

### Implementation Tasks:
1. **Repository Interfaces**:
   - `internal/domain/client/repository.go` - ClientRepository interface
   - `internal/domain/therapist/repository.go` - TherapistRepository interface
   - Update `internal/domain/user/repository.go` with role-based queries

2. **PostgreSQL Implementations**:
   - `internal/repository/client/postgres/client_repo.go`
   - `internal/repository/therapist/postgres/therapist_repo.go`
   - Update `internal/repository/user/postgres/user_repo.go` for roles

3. **Database Migration**:
   - `migrations/000002_add_user_roles_and_profiles.up.sql`
   - `migrations/000002_add_user_roles_and_profiles.down.sql`

4. **Tests to Write**:
   - Repository integration tests for all CRUD operations
   - Constraint validation tests
   - Role-based query tests

## Stage 3: Service Layer - Business Logic
**Goal**: Implement service interfaces with role-specific business logic
**Success Criteria**:
- ClientService and TherapistService implementations
- Registration flows for both user types
- All service unit tests pass
**Tests**: Registration workflows, profile management, business rule validation
**Status**: Complete

### Implementation Tasks:
1. **Service Interfaces**:
   - `internal/domain/client/service.go` - ClientService interface
   - `internal/domain/therapist/service.go` - TherapistService interface
   - Update `internal/domain/user/service.go` with role-based methods

2. **Service Implementations**:
   - `internal/service/client/client.go` - Client business logic
   - `internal/service/therapist/therapist.go` - Therapist business logic
   - Update `internal/service/user/user.go` with role handling

3. **Business Logic**:
   - Client registration with profile creation
   - Therapist registration with license verification
   - Client-therapist assignment logic

4. **Tests to Write**:
   - Mock-based unit tests for all services
   - Registration workflow tests
   - Business rule validation tests

## Stage 4: Handler Layer - HTTP Endpoints ✅
**Goal**: Create role-specific HTTP handlers and middleware
**Success Criteria**:
- Separate registration endpoints for clients and therapists ✅
- Role-based access control middleware ✅
- All handler tests pass ✅
**Tests**: HTTP request/response validation, authentication flows, authorization ✅
**Status**: Complete

**Completed Items:**
- ✅ Created `ClientHandler` with full CRUD operations
- ✅ Created `TherapistHandler` with specialization management
- ✅ Added role-based middleware (`RequireClientRole`, `RequireTherapistRole`)
- ✅ Enhanced `UserHandler` with role-based registration
- ✅ Complete DTO system with validation
- ✅ 26 new API endpoints with proper access control
- ✅ All tests passing with excellent coverage

### Implementation Tasks:
1. **Handler Extensions**:
   - `internal/handler/client/handler.go` - Client-specific endpoints
   - `internal/handler/therapist/handler.go` - Therapist-specific endpoints
   - Update `internal/handler/user_handler.go` with role logic

2. **Middleware Updates**:
   - Update `internal/handler/http/middleware.go` with role-based auth
   - Add role checking utilities

3. **DTOs and Validation**:
   - `internal/handler/client/dto.go` - Client request/response types
   - `internal/handler/therapist/dto.go` - Therapist request/response types
   - Update existing DTOs with role fields

4. **Route Updates**:
   - Update `internal/handler/routes.go` with new endpoints
   - Add role-protected routes

5. **Tests to Write**:
   - Handler unit tests with mock services
   - Authorization middleware tests
   - End-to-end API tests

## Stage 5: Integration and API Testing ✅
**Goal**: Complete integration with updated API test suite
**Success Criteria**:
- All existing tests pass with minimal changes ✅
- New API endpoints work correctly ✅
- Full test coverage maintained ✅
**Tests**: Complete API test suite, role-based access scenarios ✅
**Status**: Complete

**Completed Items:**
- ✅ Updated Container/DI with all new services and repositories
- ✅ Wired ClientService and TherapistService with dependencies
- ✅ Updated main.go to use the new router
- ✅ Created 3 new integration test scripts
- ✅ Extended test suite to cover role-based flows
- ✅ All compilation and tests passing
- ✅ Final binary builds successfully
- ✅ Docker containers running and healthy
- ✅ Database migrations successful
- ✅ Complete integration test suite passed
- ✅ Live API testing successful

### Implementation Tasks:
1. **Update Container/DI**:
   - Update `internal/infrastructure/container/container.go`
   - Wire new services and repositories

2. **API Test Scripts**:
   - Update `test/curl/01-register-users.sh` for role-based registration
   - Add `test/curl/05-client-therapist-flows.sh`
   - Update existing test scripts for backward compatibility

3. **Integration Tests**:
   - Update existing integration tests
   - Add role-specific integration scenarios

4. **Documentation Updates**:
   - Update API documentation
   - Update database schema documentation

## Implementation Guidelines

### Test-First Approach
1. **Red Phase**: Write failing test for new functionality
2. **Green Phase**: Write minimal code to make test pass
3. **Refactor Phase**: Clean up code while keeping tests green
4. **Commit**: Commit working increment with clear message

### Code Quality Standards
- Follow existing patterns in codebase
- Maintain clean architecture boundaries
- Use dependency injection consistently
- Keep functions small and focused
- Write descriptive test names

### Migration Strategy
- Maintain backward compatibility where possible
- Existing user table becomes foundation
- Add new tables with proper constraints
- Gradual rollout of role-based features

### Error Handling
- Consistent error messages across layers
- Proper validation at each layer boundary
- Clear error responses for API consumers
- Fail fast with descriptive context

## Dependencies and Tools
- Existing toolchain: Go 1.24, PostgreSQL 15, Docker
- Testing: Go testing package, existing mock patterns
- Migration: golang-migrate library
- No new external dependencies required

## Success Metrics
- [ ] All existing functionality remains intact
- [ ] New user registration supports both roles
- [ ] Role-based access control works correctly
- [ ] Database constraints prevent invalid data
- [ ] API test suite covers all scenarios
- [ ] Code coverage maintains current levels (80%+)
- [ ] Clean separation of concerns maintained

## Risk Mitigation
- **Breaking Changes**: Implement features additively
- **Data Migration**: Use safe migration patterns with rollback
- **Performance**: Add database indexes for new queries
- **Security**: Validate role assignments at multiple layers

## Next Steps
Start with Stage 1 - Domain Layer implementation following TDD principles.