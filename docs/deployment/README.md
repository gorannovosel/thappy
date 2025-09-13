# Thappy Deployment Guide

This guide covers deployment options for the Thappy full-stack application.

## Quick Start

### Development Environment
```bash
# Clone and setup
git clone <repository>
cd thappy
make setup

# Start full stack
make dev-full
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database Admin: localhost:5433

### Production Environment
```bash
# Build and start all services
make production-build
make production-frontend
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   React + TS    │───▶│   Go + Gin      │───▶│   Database      │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   RabbitMQ      │
                    │   Message Queue │
                    │   Port: 5672    │
                    └─────────────────┘
```

## Environment Configuration

### Backend (.env)
```env
# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=thappy
DB_PASSWORD=your_secure_password
DB_NAME=thappy
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-jwt-secret-change-in-production
JWT_TOKEN_TTL=24h

# App
APP_NAME=thappy
APP_ENV=production
LOG_LEVEL=info
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## Docker Deployment

### Option 1: Docker Compose (Recommended)

#### Development
```bash
# Start all services
make dev

# Or start detached
make dev-detached

# View logs
make logs

# Stop services
make stop
```

#### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Individual Containers

#### Backend
```bash
# Build backend
make docker-build

# Run backend container
docker run -d \
  --name thappy-api \
  -p 8080:8080 \
  --env-file .env \
  thappy:latest
```

#### Frontend
```bash
# Build frontend
cd frontend
docker build -t thappy-frontend .

# Run frontend container
docker run -d \
  --name thappy-frontend \
  -p 3000:80 \
  thappy-frontend:latest
```

## Cloud Deployment

### AWS ECS/Fargate

1. **Push images to ECR**:
```bash
# Build and tag
docker build -t thappy-api .
docker tag thappy-api:latest <account>.dkr.ecr.<region>.amazonaws.com/thappy-api:latest

# Push
docker push <account>.dkr.ecr.<region>.amazonaws.com/thappy-api:latest
```

2. **Create ECS Task Definition**:
```json
{
  "family": "thappy",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "thappy-api",
      "image": "<account>.dkr.ecr.<region>.amazonaws.com/thappy-api:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ]
    }
  ]
}
```

### Kubernetes

1. **Create namespace**:
```bash
kubectl create namespace thappy
```

2. **Deploy backend**:
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: thappy-api
  namespace: thappy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: thappy-api
  template:
    metadata:
      labels:
        app: thappy-api
    spec:
      containers:
      - name: thappy-api
        image: thappy:latest
        ports:
        - containerPort: 8080
```

### Digital Ocean App Platform

1. **Create app spec**:
```yaml
# .do/app.yaml
name: thappy
services:
- name: api
  source_dir: /
  github:
    repo: your-org/thappy
    branch: main
  run_command: ./bin/thappy
  environment_slug: go
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  env:
  - key: APP_ENV
    value: production
- name: frontend
  source_dir: /frontend
  build_command: npm run build
  run_command: serve -s build -p 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
databases:
- name: thappy-db
  engine: PG
  version: "13"
```

## Database Setup

### Development
Database runs automatically with `make dev`.

### Production

#### Option 1: Self-hosted PostgreSQL
```bash
# Run PostgreSQL container
docker run -d \
  --name thappy-postgres \
  -e POSTGRES_DB=thappy \
  -e POSTGRES_USER=thappy \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
make migrate-up
```

#### Option 2: Managed Database
- AWS RDS
- Google Cloud SQL
- Digital Ocean Managed Database
- Supabase

Update connection string in `.env`:
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSLMODE=require
```

## Health Checks

### API Health
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "thappy-api"
}
```

### Frontend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "thappy-frontend"
}
```

## Monitoring

### Logs
```bash
# All services
make logs

# API only
make logs-api

# Frontend only
docker-compose logs -f frontend
```

### Metrics
- **Backend**: Built-in metrics at `/metrics` endpoint
- **Frontend**: Performance metrics via Web Vitals
- **Database**: PostgreSQL built-in monitoring

## Security

### Production Checklist
- [ ] Change all default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up proper firewall rules
- [ ] Enable database SSL
- [ ] Regular security updates

### HTTPS Setup
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Scaling

### Horizontal Scaling
```bash
# Scale API containers
docker-compose up -d --scale api=3

# Scale in Kubernetes
kubectl scale deployment thappy-api --replicas=5
```

### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Database sharding for very large datasets

## Backup & Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U thappy thappy > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U thappy thappy < backup.sql
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database is running: `make logs-api`
   - Verify connection string
   - Check network connectivity

2. **Frontend Build Failed**
   - Clear node_modules: `rm -rf frontend/node_modules`
   - Reinstall: `make frontend-install`
   - Check for TypeScript errors

3. **API Not Responding**
   - Check logs: `make logs-api`
   - Verify port is available
   - Check environment variables

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
export DEBUG=true
```

## Performance Optimization

### Frontend
- Bundle analysis: `npm run build -- --analyze`
- Enable gzip compression in nginx
- Use CDN for static assets
- Implement service worker for caching

### Backend
- Connection pooling
- Database query optimization
- Redis caching
- Load balancing

## Support

For deployment issues:
1. Check logs first: `make logs`
2. Verify environment configuration
3. Test individual components
4. Check firewall/network settings

For more help, see:
- [Development Guide](../development/README.md)
- [API Documentation](../api/README.md)
- [Architecture Overview](../architecture/README.md)