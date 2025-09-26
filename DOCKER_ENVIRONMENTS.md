# Docker Environment Configuration

This project now supports separate Docker configurations for local development and production.

## Local Development

**File**: `docker-compose.local.yml`
**Command**: `make dev`

- Uses development environment variables
- Frontend API points to `http://localhost:3004` (with nginx proxy)
- Nginx proxies `/api/*` requests to API container
- Includes RabbitMQ for full local development
- Database runs on port 5433 (to avoid conflicts)

## Production

**File**: `docker-compose.prod.yml`
**Command**: `make prod`

- Uses production environment variables from `.env.prod`
- Requires production secrets (DB password, JWT secret)
- Frontend API points to production domain
- Optimized for production deployment
- Uses container networking for security

## Environment Files

### Frontend Environment Files

- `.env.development` - Local non-Docker development (points to localhost:8081)
- `.env.development.docker` - Docker development (points to localhost:3004 + nginx proxy)
- `.env.production` - Production builds (points to production API)

### Backend Environment Files

- `.env` - Local development database and configuration
- `.env.prod` - Production secrets and configuration (create from `.env.prod.example`)

## Commands

### Development
```bash
make dev          # Start full Docker development environment
make dev-local    # Start local development (no Docker)
make stop         # Stop development environment
make clean        # Stop and clean up volumes
make logs         # View development logs
```

### Production
```bash
make prod         # Start production environment
make prod-stop    # Stop production environment
make prod-logs    # View production logs
```

## Port Configuration

### Development (Docker)
- Frontend: `http://localhost:3004`
- API: `http://localhost:8081`
- Database: `localhost:5433`
- RabbitMQ Management: `http://localhost:15672`

### Local Development (No Docker)
- Frontend: `http://localhost:3004`
- API: `http://localhost:8081`
- Database: `localhost:5433` (via Docker)

### Production
- Configurable via environment variables
- Default Frontend: `localhost:3000`
- Default API: `localhost:8081`

## Nginx Proxy

In Docker, the frontend uses nginx which proxies API requests:
- Frontend requests to `/api/*` → API container at `api:8081/api/*`
- This avoids CORS issues and provides clean routing