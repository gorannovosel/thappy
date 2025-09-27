# CI/CD Security Analysis Prompt

Use this prompt to get a comprehensive security analysis of the Thappy project's CI/CD pipeline and infrastructure.

---

## Comprehensive CI/CD & Infrastructure Security Analysis Request

I need a detailed security analysis of our production CI/CD pipeline and infrastructure. Please analyze all aspects for vulnerabilities, best practices, and security improvements.

### Project Context
- **Project**: Thappy - Mental health services platform
- **Stack**: Go backend, React frontend, PostgreSQL database
- **Infrastructure**: Digital Ocean droplet with Docker containers
- **Web Server**: Caddy v2 (migrated from nginx)
- **CI/CD**: GitHub Actions with automated deployment

### Infrastructure Details

**Production Environment:**
- **Server**: Digital Ocean droplet thappy-prod (164.92.134.4)
- **OS**: Ubuntu 22.04 LTS
- **Resources**: 1GB RAM, 1 vCPU, 25GB SSD
- **Exposed Ports**: 80 (HTTP), 8081 (API direct), 22 (SSH)
- **Container Platform**: Docker with Docker Compose

**Services Architecture:**
```
Internet → Port 80 → Caddy → Static Files (React)
                    ↓
Internet → Port 80 → /api/* → Reverse Proxy → Backend:8081 → PostgreSQL:5432
                                                    ↓
Internet → Port 8081 → Direct Backend API Access (currently exposed)
```

**Database:**
- PostgreSQL 15 in Docker container
- Database: `thappy`, User: `thappy`
- Internal network: postgres:5432
- No external exposure (correct)

### GitHub Actions Workflow Analysis

**Workflow File**: `.github/workflows/deploy.yml`

**GitHub Secrets Used:**
- `DO_ACCESS_TOKEN` - Digital Ocean API token (full account access)
- `DO_SSH_KEY` - SSH private key for droplet access
- `DB_PASSWORD_PROD` - Production database password
- `JWT_SECRET_PROD` - JWT signing key for authentication
- `CORS_ALLOWED_ORIGINS` - CORS configuration

**Deployment Process:**
1. Tests run on GitHub runners
2. Docker images built and pushed nowhere (local build)
3. SSH into production server using private key
4. Git pull latest code on production server
5. Docker Compose down/up with production environment
6. Database migrations applied via Docker
7. Health checks performed

### Configuration Files to Analyze

**GitHub Actions Workflow:**
```yaml
# Key sections from .github/workflows/deploy.yml:

# Authentication
- name: Install doctl
  uses: digitalocean/action-doctl@v2
  with:
    token: ${{ secrets.DO_ACCESS_TOKEN }}

# SSH Setup  
- name: Setup SSH
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.DO_SSH_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan -H ${{ steps.droplet.outputs.ip }} >> ~/.ssh/known_hosts

# Environment Generation
- name: Create deployment environment
  env:
    DB_PASSWORD: ${{ secrets.DB_PASSWORD_PROD }}
    JWT_SECRET: ${{ secrets.JWT_SECRET_PROD }}
    CORS_ALLOWED_ORIGINS: ${{ secrets.CORS_ALLOWED_ORIGINS }}
  run: |
    cat > .env.production << EOF
    DB_USER=thappy
    DB_PASSWORD=${DB_PASSWORD}
    DB_NAME=thappy
    DB_HOST=postgres
    DB_PORT=5432
    DB_SSLMODE=disable
    JWT_SECRET=${JWT_SECRET}
    # ... other config
    EOF
    ssh root@${{ steps.droplet.outputs.ip }} "mkdir -p /opt/thappy"
    scp -i ~/.ssh/id_rsa .env.production root@${{ steps.droplet.outputs.ip }}:/opt/thappy/

# Deployment
- name: Deploy application
  run: |
    ssh root@${{ steps.droplet.outputs.ip }} "
      cd /opt/thappy &&
      git fetch origin &&
      git reset --hard origin/main &&
      docker-compose -f docker-compose.production.yml --env-file .env.production down || true &&
      docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build &&
      # Database migration with exposed connection string
      docker run --rm --network thappy-network-prod -v /opt/thappy/migrations:/migrations migrate/migrate -path=/migrations -database='postgres://thappy:${DB_PASSWORD}@postgres:5432/thappy?sslmode=disable' up
    "
```

**Caddy Configuration (frontend/Caddyfile):**
```caddy
{
    admin off
    auto_https off
}

:80 {
    encode gzip
    
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff" 
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    handle /health {
        header Content-Type application/json
        respond `{"status":"healthy","service":"thappy-frontend"}` 200
    }

    handle /api/* {
        @options method OPTIONS
        handle @options {
            header {
                Access-Control-Allow-Origin "*"
                Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
                Access-Control-Max-Age "86400"
            }
            respond "" 204
        }
    }

    handle /api/* {
        header {
            Access-Control-Allow-Origin "*"
            Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" 
            Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
        }
        reverse_proxy backend:8081
    }

    handle {
        root * /usr/share/caddy
        try_files {path} {path}/ /index.html
        file_server
    }
}
```

**Docker Compose Production:**
- Services: postgres, backend, frontend
- Network: thappy-network-prod
- No explicit volume encryption
- Environment file: .env.production

### Current Security Concerns Identified

1. **Network Exposure:**
   - Port 8081 (backend API) directly exposed to internet
   - Should only be accessible via Caddy proxy

2. **SSH Access:**
   - Using root user for deployment
   - SSH key stored in GitHub Secrets

3. **Secrets Management:**
   - Secrets transmitted to production server as plain text
   - Database password visible in migration command

4. **HTTPS:**
   - Currently HTTP-only (no TLS/SSL)
   - Caddy has auto_https disabled

5. **Authentication:**
   - JWT secrets in environment variables
   - No secret rotation mechanism

### Analysis Request

Please provide a comprehensive security analysis covering:

#### 1. Infrastructure Security
- Network configuration and firewall rules
- Server hardening recommendations
- Container security best practices
- Database security configuration

#### 2. CI/CD Pipeline Security  
- GitHub Actions workflow vulnerabilities
- Secret management security
- Deployment process security gaps
- Supply chain security considerations

#### 3. Application Security
- Authentication and authorization
- API security (CORS, rate limiting, etc.)
- Frontend security headers and configuration
- Database security and connection handling

#### 4. Network Security
- TLS/SSL implementation recommendations
- Proxy configuration security
- Internal network isolation
- DDoS protection considerations

#### 5. Monitoring and Incident Response
- Security logging and monitoring gaps
- Intrusion detection recommendations
- Backup and disaster recovery security
- Incident response procedures

#### 6. Compliance and Best Practices
- Industry security standards compliance
- OWASP recommendations implementation
- Security testing integration
- Documentation and security policies

### Priority Classification

Please classify findings as:
- **CRITICAL** - Immediate security risks requiring urgent action
- **HIGH** - Significant vulnerabilities needing prompt attention  
- **MEDIUM** - Important security improvements
- **LOW** - Best practice recommendations

### Implementation Guidance

For each finding, please provide:
1. Detailed explanation of the security risk
2. Potential attack vectors and impact
3. Step-by-step remediation instructions
4. Code examples where applicable
5. Testing procedures to verify fixes

### Current Working State

The system is fully functional with:
- ✅ Frontend: http://164.92.134.4 (200 OK)
- ✅ API: http://164.92.134.4/api/therapies (200 OK, 12 items)
- ✅ Database: PostgreSQL accessible, 6 tables, migrations working
- ✅ CI/CD: Automated deployment working end-to-end
- ✅ CORS: Working correctly for cross-origin requests

Please ensure any security recommendations maintain this functional state while improving security posture.
