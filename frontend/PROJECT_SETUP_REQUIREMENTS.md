# Project Setup Requirements

## Infrastructure Requirements

### Production Environment
- **Cloud Provider**: Digital Ocean
- **Droplet**: thappy-prod (164.92.134.4)
- **Operating System**: Ubuntu 22.04 LTS
- **Resources**: 1GB RAM, 1 vCPU, 25GB SSD
- **Network**: External IP with port 80 (HTTP) and 8081 (API) exposed

### Required Software Stack
- **Docker Engine**: v24.0+
- **Docker Compose**: v2.0+
- **Git**: For repository management
- **SSH**: Secure access for deployment

### Web Server
- **Primary**: Caddy v2 (Modern web server)
- **Features**:
  - Automatic HTTPS capability (disabled for HTTP-only setup)
  - Built-in compression (gzip)
  - Security headers
  - Reverse proxy for API
  - CORS handling

### Database
- **Database**: PostgreSQL 15
- **Container**: postgres:15-alpine
- **Configuration**:
  - Database: `thappy`
  - User: `thappy`
  - Port: 5432 (internal), 5433 (external)
  - SSL Mode: disabled (internal network)
  - Connection Pooling: 25 max connections

### Backend Services
- **Runtime**: Go 1.21+
- **Framework**: Chi router with custom middleware
- **Architecture**: Clean architecture with dependency injection
- **Features**:
  - JWT authentication
  - CORS middleware
  - Health checks
  - Database migrations
  - API rate limiting

### Frontend
- **Framework**: React 18+
- **Build Tool**: Create React App
- **Package Manager**: pnpm v8
- **Features**:
  - TypeScript support
  - Responsive design
  - Client-side routing
  - API integration

## CI/CD Pipeline

### GitHub Actions Requirements
- **Workflow File**: `.github/workflows/deploy.yml`
- **Triggers**: Push to main branch, manual dispatch
- **Stages**:
  1. Backend testing (Go test suite)
  2. Docker image building
  3. Digital Ocean deployment
  4. Health checks and verification

### Required GitHub Secrets
- `DO_ACCESS_TOKEN`: Digital Ocean API token
- `DO_SSH_KEY`: SSH private key for droplet access
- `DB_PASSWORD_PROD`: Production database password
- `JWT_SECRET_PROD`: Production JWT signing key
- `CORS_ALLOWED_ORIGINS`: Allowed CORS origins

### Security Requirements
- **Authentication**: JWT tokens with bcrypt password hashing
- **Network Security**: SSH key-based access, internal database network
- **CORS**: Configured for cross-origin requests
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## Network Architecture

### Production URLs
- **Frontend**: http://164.92.134.4
- **API**: http://164.92.134.4:8081
- **Health Check**: http://164.92.134.4/health
- **Database**: Internal network only (postgres:5432)

### API Routing
- **Static Files**: Served by Caddy at `/`
- **API Proxy**: `/api/*` proxied to backend:8081
- **CORS**: Handled by Caddy for all API requests
- **Health**: `/health` endpoint for monitoring
