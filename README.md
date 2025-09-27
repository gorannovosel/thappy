# Thappy - Mental Health Services Platform

[![Go Version](https://img.shields.io/badge/Go-1.24-blue.svg)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A full-stack mental health services platform with therapist search, therapy resources, and user management. Built with Go backend, React frontend, and PostgreSQL following clean architecture principles.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo>
cd thappy
cp .env.example .env

# Start backend services
make dev

# Start frontend (in another terminal)
make frontend-dev

# Run tests
make test

# Test API endpoints
./test/curl/run-all-tests.sh
```

**Development:**
- Backend API: `http://localhost:8080`
- Frontend App: `http://localhost:3004`

**Production:**
- Server: `http://164.92.134.4` (Digital Ocean)
- Backend API: `http://164.92.134.4:8081`
- Deployed via GitHub Actions on every push to main

## 📋 Features

### 🔐 Authentication & User Management
- ✅ **User Registration & Login** - Secure authentication with JWT tokens
- ✅ **Role-Based Access** - Client and therapist user roles
- ✅ **Password Security** - bcrypt hashing with configurable cost
- ✅ **Protected Endpoints** - JWT middleware for authenticated routes

### 🔍 Therapist Discovery
- ✅ **Therapist Search** - Real-time search by name, specialization, or bio
- ✅ **Advanced Filtering** - Filter by availability and specializations
- ✅ **Profile Management** - Complete therapist profile system
- ✅ **Contact Integration** - Direct therapist contact information

### 📚 Content Management
- ✅ **Therapy Resources** - Educational articles and therapy information
- ✅ **Dynamic Content** - Database-driven content with search capabilities
- ✅ **Responsive Design** - Mobile-first React frontend

### 🛠️ Technical Features
- ✅ **Database Integration** - PostgreSQL with migrations and connection pooling
- ✅ **Message Queue** - RabbitMQ integration for future features
- ✅ **Health Checks** - API and database health monitoring
- ✅ **Docker Support** - Complete containerized development environment
- ✅ **Comprehensive Testing** - Unit tests, integration tests, and API test suite
- ✅ **CI/CD Pipeline** - Automated deployment to Digital Ocean with GitHub Actions

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
- [**CI/CD Pipeline**](CLI_COMMANDS.md) - Digital Ocean deployment automation
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

### Production Database Access
```bash
make tunnel-create    # Create SSH tunnel to production database
make tunnel-connect   # Connect to production database via tunnel
make tunnel-status    # Show SSH tunnel status
make tunnel-test      # Test tunnel connection
make tunnel-kill      # Kill SSH tunnel
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

### CI/CD Commands
```bash
make deploy           # Trigger production deployment
make deploy-status    # Check deployment status
make deploy-rollback  # Rollback to previous version
make gh-deploy        # Manual GitHub Actions deploy trigger
make do-status        # Check Digital Ocean droplet status
make do-ssh           # SSH into production server
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
| CI/CD Pipeline | 🟡 95% Complete | N/A | Deployment automation ready |

### 🚀 CI/CD Pipeline Status
- ✅ **GitHub Actions Workflow** - Automated testing and deployment
- ✅ **Digital Ocean Infrastructure** - Production droplet configured
- ✅ **Docker Build Pipeline** - Frontend and backend builds working
- ✅ **Automated Testing** - Backend tests run on every push
- ✅ **SSH Setup** - Secure deployment access configured with dedicated deploy user
- ✅ **Production Deployment** - Fully automated with security improvements
- ✅ **Security Hardening** - Read-only API tokens and minimal permissions

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

### Development Database
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

### Production Database Access

**Production database is secured and requires SSH tunnel access.**

#### Method 1: SSH Tunnel + Direct Connection
```bash
# 1. Create SSH tunnel to production database
ssh -L 15432:172.18.0.3:5432 deploy@164.92.134.4 -N &

# 2. Connect through tunnel (password required)
psql -h localhost -p 15432 -U thappy -d thappy
```

#### Method 2: Direct SSH Access
```bash
# Connect directly via SSH
ssh deploy@164.92.134.4 "sudo docker exec -it thappy-postgres-prod psql -U thappy -d thappy"
```

#### DBeaver Configuration
**Option A: Manual Tunnel (Recommended)**
1. Create tunnel: `make tunnel-create` (or `ssh -L 15432:172.18.0.3:5432 deploy@164.92.134.4 -N &`)
2. DBeaver settings (no SSH tunnel):
   - Host: `localhost`
   - Port: `15432`
   - Database: `thappy`
   - Username: `thappy`
   - Password: (contact admin for credentials)

**Option B: DBeaver SSH Tunnel**
- SSH Host: `164.92.134.4`
- SSH User: `deploy`
- SSH Key: `/home/goran/.ssh/id_rsa`
- Remote Host: `172.18.0.3` (PostgreSQL container IP)
- Remote Port: `5432`

#### Production Database Details
- **Host**: 164.92.134.4 (behind SSH)
- **Database**: thappy
- **Username**: thappy
- **Container IP**: 172.18.0.3 (internal Docker network)
- **Security**: Not exposed to internet, SSH tunnel required

#### SSH Tunnel Troubleshooting

**Port Already in Use Error:**
```bash
# Check what's using the port
netstat -tlnp | grep :15432

# Use different port
ssh -L 25432:172.18.0.3:5432 deploy@164.92.134.4 -N &
```

**Tunnel Command Breakdown:**
```bash
ssh -L 15432:172.18.0.3:5432 deploy@164.92.134.4 -N &
#   │   │     │         │     │                   │  │
#   │   │     │         │     │                   │  └─ Run in background
#   │   │     │         │     │                   └─ No remote command execution
#   │   │     │         │     └─ SSH server (production)
#   │   │     │         └─ PostgreSQL port in container
#   │   │     └─ PostgreSQL container IP
#   │   └─ Local port on your machine
#   └─ Port forwarding flag
```

**Kill Hanging Tunnels:**
```bash
# Find tunnel processes
ps aux | grep -E "ssh.*-L.*15432"

# Kill all SSH tunnels to production
pkill -f "ssh.*164.92.134.4"
```

**Test Tunnel Connection:**
```bash
# Test if tunnel port is accessible
nc -z localhost 15432 && echo "Tunnel working" || echo "Tunnel failed"

# Test database connection through tunnel (password required)
psql -h localhost -p 15432 -U thappy -d thappy -c "SELECT 'Connected!' as status;"
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