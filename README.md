# Thappy - User Authentication API

[![Go Version](https://img.shields.io/badge/Go-1.24-blue.svg)](https://golang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-ready user authentication API built with Go, PostgreSQL, and RabbitMQ following Test-Driven Development (TDD) principles and clean architecture patterns.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd thappy
cp .env.example .env

# Start development environment
make dev

# Run tests
make test

# Test API endpoints
./test/curl/run-all-tests.sh
```

**API will be available at:** `http://localhost:8080`

## 📋 Features

- ✅ **User Registration & Login** - Secure authentication with JWT tokens
- ✅ **Password Security** - bcrypt hashing with configurable cost
- ✅ **Input Validation** - Comprehensive email and password validation
- ✅ **Protected Endpoints** - JWT middleware for authenticated routes
- ✅ **Database Integration** - PostgreSQL with migrations and connection pooling
- ✅ **Message Queue** - RabbitMQ integration for future features
- ✅ **Health Checks** - API and database health monitoring
- ✅ **Docker Support** - Complete containerized development environment
- ✅ **Comprehensive Testing** - Unit tests, integration tests, and API test suite

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Layer    │────│  Service Layer  │────│ Repository Layer│
│   (Handlers)    │    │   (Business)    │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middleware    │    │  Domain Layer   │    │   PostgreSQL    │
│  (Auth/CORS)    │    │   (Entities)    │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Design Principles:**
- Clean Architecture with dependency injection
- Domain-driven design with entity-based structure
- Test-driven development (TDD) approach
- Professional Go project organization

## 📖 Documentation

### 🎯 Quick References
- [**API Reference**](docs/api/README.md) - Complete endpoint documentation
- [**Database Schema**](docs/api/database.md) - Tables, relationships, migrations
- [**Authentication Guide**](docs/guides/authentication.md) - JWT implementation details

### 🛠️ Development
- [**Development Setup**](docs/development/setup.md) - Local environment setup
- [**Testing Guide**](docs/development/testing.md) - Running and writing tests
- [**Contributing**](docs/development/contributing.md) - Code standards and workflow

### 🚀 Deployment
- [**Docker Guide**](docs/deployment/docker.md) - Container setup and configuration
- [**Environment Configuration**](docs/deployment/configuration.md) - Settings and secrets
- [**Production Deployment**](docs/deployment/production.md) - Production best practices

### 🏛️ Architecture
- [**System Design**](docs/architecture/overview.md) - High-level architecture overview
- [**Code Organization**](docs/architecture/structure.md) - Project structure and patterns
- [**Decision Records**](docs/architecture/decisions.md) - Architectural decision log

## 🔧 Development Commands

### Essential Commands
```bash
make dev              # Start development environment
make test             # Run all tests
make test-coverage    # Run tests with coverage report
make lint             # Run linters
make format           # Format code
```

### Database Commands
```bash
make migrate-up       # Apply database migrations
make migrate-down     # Rollback migrations
make db-shell         # Connect to database
```

### Docker Commands
```bash
make stop             # Stop all services
make clean            # Clean up containers and volumes
make logs             # View all service logs
make health           # Check API health
```

### Testing Commands
```bash
./test/curl/run-all-tests.sh              # Complete API test suite
./test/curl/01-register-users.sh          # User registration tests
./test/curl/02-login-users.sh             # Login and authentication tests
./test/curl/03-protected-endpoints.sh     # Protected endpoint tests
./test/curl/04-error-scenarios.sh         # Error handling tests
```

## 📊 Current Status

| Component | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Domain Layer | ✅ Complete | 89.1% | User entity with validation |
| Service Layer | ✅ Complete | 93.2% | Business logic with mocks |
| Repository Layer | ✅ Complete | 80%+ | PostgreSQL integration |
| HTTP Layer | ✅ Complete | 75%+ | REST API with middleware |
| Database | ✅ Complete | N/A | Migrations working |
| Docker | ✅ Complete | N/A | All services running |
| Testing | ✅ Complete | N/A | 5 test scripts |

## 🎯 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | API health check | No |
| `POST` | `/api/register` | User registration | No |
| `POST` | `/api/login` | User login | No |
| `GET` | `/api/profile` | Get user profile | Yes |
| `POST` | `/api/profile/update` | Update profile | Yes |

**Base URL:** `http://localhost:8080`

## 🗄️ Database Connection

```bash
# External connection (from host)
Host: localhost
Port: 5433
Database: thappy
Username: thappy
Password: thappy_dev_password

# Quick connect
psql -h localhost -p 5433 -U thappy -d thappy
```

## 🧪 Test Data

The test suite creates these users for testing:
- `alice@example.com` (password: `SecurePass123!`)
- `bob@example.com` (password: `MyPassword456!`)
- `charlie@example.com` (password: `SuperSecret789!`)

## 📝 Recent Changes

- ✅ Complete authentication system implementation
- ✅ TDD approach with comprehensive test coverage
- ✅ Professional configuration service with .env support
- ✅ Docker migration system fixed (SELinux compatibility)
- ✅ Comprehensive API test suite with curl scripts
- ✅ Clean architecture with entity-based organization

## 🤝 Contributing

1. Follow the [Development Setup](docs/development/setup.md) guide
2. Read [Contributing Guidelines](docs/development/contributing.md)
3. Check [Code Standards](docs/development/standards.md)
4. Run tests before submitting PRs: `make test && ./test/curl/run-all-tests.sh`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using TDD and clean architecture principles**