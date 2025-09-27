# Makefile for Thappy Project
# Professional, clean, and simple - following CLAUDE.md guidelines
# Enhanced with Digital Ocean and GitHub CLI integration

# =============================================================================
# Variables
# =============================================================================

APP_NAME := thappy
DOCKER_COMPOSE := docker-compose
DOCKER_COMPOSE_LOCAL := docker-compose -f docker-compose.local.yml
DOCKER_COMPOSE_PROD := docker-compose -f docker-compose.production.yml
GO := go
BACKEND_PORT := 8081
FRONTEND_PORT := 3004
DO_CONTEXT := thappy

# =============================================================================
# Help System
# =============================================================================

.DEFAULT_GOAL := help

## help: Show this help message
.PHONY: help
help:
	@echo "Thappy Development Commands:"
	@echo ""
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/  /'
	@echo ""
	@echo "Usage: make <command>"

# =============================================================================
# Development Workflow
# =============================================================================

## setup: Initialize project for development
.PHONY: setup
setup: env-setup install-deps
	@echo "✅ Project setup complete! Run 'make dev' to start development."

## dev: Start full development environment (Docker)
.PHONY: dev
dev: env-check
	$(DOCKER_COMPOSE_LOCAL) up --build

## dev-local: Start backend and frontend locally (no Docker)
.PHONY: dev-local
dev-local:
	@echo "Starting backend and frontend locally..."
	@$(MAKE) run-backend &
	@sleep 3
	@$(MAKE) run-frontend

## clean: Stop services and clean up development environment
.PHONY: clean
clean: stop
	$(DOCKER_COMPOSE_LOCAL) down -v --remove-orphans
	@pkill -f "go run.*cmd/api" 2>/dev/null || true
	@pkill -f "pnpm start" 2>/dev/null || true
	@echo "✅ Development environment cleaned"

## stop: Stop all running services
.PHONY: stop
stop:
	$(DOCKER_COMPOSE_LOCAL) down
	@pkill -f "go run.*cmd/api" 2>/dev/null || true
	@pkill -f "pnpm start" 2>/dev/null || true

## restart: Restart development environment
.PHONY: restart
restart: stop dev-local

## status: Check status of all services
.PHONY: status
status:
	@echo "Service Status:"
	@echo "Backend (port $(BACKEND_PORT)):"
	@curl -s http://localhost:$(BACKEND_PORT)/health 2>/dev/null && echo "  ✅ Running" || echo "  ❌ Not responding"
	@echo "Frontend (port $(FRONTEND_PORT)):"
	@curl -s -o /dev/null http://localhost:$(FRONTEND_PORT) 2>/dev/null && echo "  ✅ Running" || echo "  ❌ Not responding"

# =============================================================================
# Digital Ocean CLI Commands
# =============================================================================

## do-setup: Initialize Digital Ocean context
.PHONY: do-setup
do-setup:
	@echo "🌊 Setting up Digital Ocean context..."
	@doctl auth switch --context $(DO_CONTEXT) 2>/dev/null || doctl auth init --context $(DO_CONTEXT)
	@doctl compute droplet list --context $(DO_CONTEXT)

## do-create-droplet: Create production droplet
.PHONY: do-create-droplet
do-create-droplet:
	@echo "🚀 Creating Digital Ocean droplet..."
	@doctl compute droplet create thappy-prod \
		--size s-2vcpu-2gb \
		--image docker-20-04 \
		--region fra1 \
		--ssh-keys $$(doctl compute ssh-key list --format ID --no-header) \
		--wait \
		--context $(DO_CONTEXT)

## do-ssh: SSH into production droplet
.PHONY: do-ssh
do-ssh:
	@doctl compute ssh thappy-prod --context $(DO_CONTEXT)

## do-logs: View production logs
.PHONY: do-logs
do-logs:
	@doctl compute ssh thappy-prod --context $(DO_CONTEXT) \
		--ssh-command "cd /opt/thappy && docker-compose -f docker-compose.production.yml logs -f"

## do-status: Check droplet status
.PHONY: do-status
do-status:
	@echo "📊 Droplet Status:"
	@doctl compute droplet get thappy-prod \
		--format Name,Status,PublicIPv4,Memory,VCPUs,Region,CreatedAt \
		--context $(DO_CONTEXT) 2>/dev/null || echo "Droplet not found"
	@echo ""
	@echo "🔥 Firewall Rules:"
	@doctl compute firewall list --context $(DO_CONTEXT) 2>/dev/null || echo "No firewall configured"

## do-snapshot: Create droplet snapshot
.PHONY: do-snapshot
do-snapshot:
	@echo "📸 Creating droplet snapshot..."
	@DROPLET_ID=$$(doctl compute droplet list --format ID,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
	doctl compute droplet-action snapshot $$DROPLET_ID \
		--snapshot-name "thappy-backup-$$(date +%Y%m%d-%H%M%S)" \
		--wait \
		--context $(DO_CONTEXT)

## do-list-snapshots: List all snapshots
.PHONY: do-list-snapshots
do-list-snapshots:
	@echo "💾 Available Snapshots:"
	@doctl compute snapshot list --resource droplet --context $(DO_CONTEXT)

## do-firewall-setup: Setup firewall rules
.PHONY: do-firewall-setup
do-firewall-setup:
	@echo "🔒 Setting up firewall..."
	@if ! doctl compute firewall list --format Name --no-header --context $(DO_CONTEXT) | grep -q "thappy-firewall"; then \
		doctl compute firewall create --name thappy-firewall \
			--inbound-rules "protocol:tcp,ports:22,sources:address:0.0.0.0/0 protocol:tcp,ports:80,sources:address:0.0.0.0/0 protocol:tcp,ports:443,sources:address:0.0.0.0/0 protocol:tcp,ports:8081,sources:address:0.0.0.0/0" \
			--outbound-rules "protocol:tcp,ports:all,destinations:address:0.0.0.0/0 protocol:udp,ports:all,destinations:address:0.0.0.0/0" \
			--context $(DO_CONTEXT); \
		DROPLET_ID=$$(doctl compute droplet list --format ID,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
		FIREWALL_ID=$$(doctl compute firewall list --format ID,Name --no-header --context $(DO_CONTEXT) | grep thappy-firewall | awk '{print $$1}') && \
		doctl compute firewall add-droplets $$FIREWALL_ID --droplet-ids $$DROPLET_ID --context $(DO_CONTEXT); \
	else \
		echo "Firewall already exists"; \
	fi

## do-destroy-droplet: Destroy production droplet (DANGEROUS!)
.PHONY: do-destroy-droplet
do-destroy-droplet:
	@echo "⚠️  WARNING: This will destroy the production droplet!"
	@read -p "Type 'DESTROY' to confirm: " confirm && \
	if [ "$$confirm" = "DESTROY" ]; then \
		doctl compute droplet delete thappy-prod --force --context $(DO_CONTEXT); \
	else \
		echo "Cancelled"; \
	fi

# =============================================================================
# GitHub CLI Commands
# =============================================================================

## gh-setup-secrets: Setup GitHub secrets for deployment
.PHONY: gh-setup-secrets
gh-setup-secrets:
	@echo "🔐 Setting up GitHub secrets..."
	@echo "Enter DO_ACCESS_TOKEN: " && read -s token && gh secret set DO_ACCESS_TOKEN --body "$$token"
	@if [ -f ~/.ssh/digitalocean_thappy ]; then \
		gh secret set DO_SSH_KEY < ~/.ssh/digitalocean_thappy; \
	else \
		echo "SSH key not found at ~/.ssh/digitalocean_thappy"; \
		echo "Generate with: ssh-keygen -t ed25519 -f ~/.ssh/digitalocean_thappy"; \
	fi
	@DROPLET_IP=$$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
		gh secret set DO_HOST_IP --body "$$DROPLET_IP"
	@echo "Enter DB_PASSWORD_PROD: " && read -s pwd && gh secret set DB_PASSWORD_PROD --body "$$pwd"
	@echo "Enter JWT_SECRET_PROD: " && read -s jwt && gh secret set JWT_SECRET_PROD --body "$$jwt"
	@gh secret set CORS_ALLOWED_ORIGINS --body "https://thappy.com,https://www.thappy.com"
	@echo "✅ Secrets configured"

## gh-list-secrets: List configured GitHub secrets
.PHONY: gh-list-secrets
gh-list-secrets:
	@echo "🔑 Configured GitHub Secrets:"
	@gh secret list

## gh-deploy: Trigger deployment via GitHub Actions
.PHONY: gh-deploy
gh-deploy:
	@echo "🚀 Triggering deployment..."
	@gh workflow run deploy --ref main

## gh-deploy-status: Check deployment status
.PHONY: gh-deploy-status
gh-deploy-status:
	@echo "📊 Recent Deployments:"
	@gh run list --workflow=deploy.yml --limit 5

## gh-deploy-watch: Watch deployment progress
.PHONY: gh-deploy-watch
gh-deploy-watch:
	@echo "👀 Watching deployment..."
	@gh run watch

## gh-deploy-logs: View deployment logs
.PHONY: gh-deploy-logs
gh-deploy-logs:
	@echo "📝 Deployment Logs:"
	@RUN_ID=$$(gh run list --workflow=deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') && \
	gh run view $$RUN_ID --log

## gh-environments: List deployment environments
.PHONY: gh-environments
gh-environments:
	@echo "🌍 Deployment Environments:"
	@gh api repos/$$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/environments 2>/dev/null || echo "No environments configured"

## gh-create-environment: Create production environment
.PHONY: gh-create-environment
gh-create-environment:
	@echo "🌍 Creating production environment..."
	@gh api repos/$$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/environments \
		-f name=production \
		-F wait_timer=5 \
		-F reviewers[]='["$$(gh api user --jq .login)"]'

# =============================================================================
# Combined Deployment Commands
# =============================================================================

## deploy: Complete deployment process
.PHONY: deploy
deploy: do-setup gh-deploy gh-deploy-watch

## deploy-status: Check complete deployment status
.PHONY: deploy-status
deploy-status: do-status gh-deploy-status

## deploy-rollback: Rollback to previous deployment
.PHONY: deploy-rollback
deploy-rollback:
	@echo "⏪ Rolling back deployment..."
	@PREVIOUS_SHA=$$(git rev-parse HEAD~1) && \
	echo "Rolling back to commit: $$PREVIOUS_SHA" && \
	gh workflow run deploy --ref $$PREVIOUS_SHA -f environment=production

## deploy-health: Check production health
.PHONY: deploy-health
deploy-health:
	@echo "🏥 Health Check:"
	@DROPLET_IP=$$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
	echo "Backend: " && curl -s http://$$DROPLET_IP:8081/health | jq '.' 2>/dev/null || echo "❌ Not responding" && \
	echo "Frontend: " && curl -s -o /dev/null -w "Status: %{http_code}\n" http://$$DROPLET_IP

## setup-production: Complete production setup
.PHONY: setup-production
setup-production:
	@echo "🚀 Setting up production environment..."
	@$(MAKE) do-setup
	@$(MAKE) do-create-droplet
	@sleep 30
	@$(MAKE) do-firewall-setup
	@$(MAKE) setup-server
	@$(MAKE) gh-setup-secrets
	@$(MAKE) gh-create-environment
	@echo "✅ Production setup complete! Run 'make deploy' to deploy the application"

## setup-server: Setup server with Docker and dependencies
.PHONY: setup-server
setup-server:
	@echo "🖥️ Setting up server..."
	@./deploy/setup-droplet.sh

## monitor: Run monitoring dashboard
.PHONY: monitor
monitor:
	@./deploy/monitor.sh

## backup: Create full backup
.PHONY: backup
backup:
	@./deploy/backup.sh

## ssl-setup: Setup SSL certificates
.PHONY: ssl-setup
ssl-setup:
	@echo "🔒 Setting up SSL certificates..."
	@read -p "Enter your domain name (e.g., thappy.com): " domain && \
	doctl compute ssh thappy-prod --context $(DO_CONTEXT) --ssh-command "\
		apt-get update && apt-get install -y certbot && \
		certbot certonly --standalone -d $$domain -d www.$$domain --non-interactive --agree-tos -m admin@$$domain"

# =============================================================================
# Individual Services
# =============================================================================

## run-backend: Start backend server locally
.PHONY: run-backend
run-backend:
	$(GO) run ./cmd/api

## run-frontend: Start frontend development server
.PHONY: run-frontend
run-frontend:
	cd frontend && pnpm start

# =============================================================================
# Building & Testing
# =============================================================================

## build: Build backend for production
.PHONY: build
build:
	CGO_ENABLED=0 GOOS=linux $(GO) build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o bin/$(APP_NAME) ./cmd/api

## build-all: Build both backend and frontend for production
.PHONY: build-all
build-all: build
	cd frontend && pnpm run build

## test: Run all tests
.PHONY: test
test:
	$(GO) test -v -race ./...
	cd frontend && pnpm run test:coverage

## test-backend: Run backend tests only
.PHONY: test-backend
test-backend:
	$(GO) test -v -race ./...

## test-frontend: Run frontend tests only
.PHONY: test-frontend
test-frontend:
	cd frontend && pnpm run test:coverage

# =============================================================================
# Code Quality
# =============================================================================

## lint: Run linters for both backend and frontend
.PHONY: lint
lint:
	@echo "Running backend linters..."
	@if command -v golangci-lint >/dev/null 2>&1; then golangci-lint run ./...; else $(HOME)/go/bin/golangci-lint run ./... 2>/dev/null || echo "golangci-lint not found, skipping"; fi
	@echo "Running frontend linters..."
	cd frontend && pnpm run lint

## format: Format code for both backend and frontend
.PHONY: format
format:
	@echo "Formatting backend code..."
	$(GO) fmt ./...
	@if command -v goimports >/dev/null 2>&1; then goimports -w .; else $(HOME)/go/bin/goimports -w . 2>/dev/null || echo "goimports not found, skipping"; fi
	@echo "Formatting frontend code..."
	cd frontend && pnpm run format

## format-check: Check code formatting without making changes
.PHONY: format-check
format-check:
	@echo "Checking backend formatting..."
	@test -z "$$(gofmt -l .)" || (echo "Backend code needs formatting. Run 'make format'" && exit 1)
	@echo "Checking frontend formatting..."
	cd frontend && pnpm run format:check

## type-check: Run TypeScript type checking
.PHONY: type-check
type-check:
	cd frontend && pnpm run type-check

# =============================================================================
# Database Operations
# =============================================================================

## migrate-up: Run database migrations
.PHONY: migrate-up
migrate-up:
	$(DOCKER_COMPOSE_LOCAL) run --rm migrate

## migrate-create: Create new migration (usage: make migrate-create NAME=migration_name)
.PHONY: migrate-create
migrate-create:
	@if [ -z "$(NAME)" ]; then \
		echo "❌ Error: NAME is required. Usage: make migrate-create NAME=migration_name"; \
		exit 1; \
	fi
	@if command -v migrate >/dev/null 2>&1; then migrate create -ext sql -dir migrations -seq $(NAME); else $(HOME)/go/bin/migrate create -ext sql -dir migrations -seq $(NAME); fi
	@echo "✅ Migration created: migrations/*_$(NAME).sql"

## db-shell: Connect to database shell
.PHONY: db-shell
db-shell:
	$(DOCKER_COMPOSE_LOCAL) exec postgres psql -U thappy -d thappy

## db-backup: Create database backup
.PHONY: db-backup
db-backup:
	@DROPLET_IP=$$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
	BACKUP_NAME="thappy-db-$$(date +%Y%m%d-%H%M%S).sql" && \
	doctl compute ssh thappy-prod --context $(DO_CONTEXT) --ssh-command \
		"docker exec thappy-postgres-prod pg_dump -U thappy thappy > /opt/thappy/backups/$$BACKUP_NAME && echo 'Backup saved as $$BACKUP_NAME'"

## db-restore: Restore database from backup
.PHONY: db-restore
db-restore:
	@read -p "Enter backup filename: " backup && \
	DROPLET_IP=$$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $(DO_CONTEXT) | grep thappy-prod | awk '{print $$1}') && \
	doctl compute ssh thappy-prod --context $(DO_CONTEXT) --ssh-command \
		"docker exec -i thappy-postgres-prod psql -U thappy thappy < /opt/thappy/backups/$$backup"

# =============================================================================
# CI/CD Pipeline
# =============================================================================

## ci: Run complete CI pipeline (format, lint, type-check, test)
.PHONY: ci
ci: format-check lint type-check test
	@echo "✅ CI pipeline completed successfully"

## ci-fix: Fix code quality issues and run CI
.PHONY: ci-fix
ci-fix: format lint ci

# =============================================================================
# Dependencies & Environment
# =============================================================================

## install-deps: Install all dependencies
.PHONY: install-deps
install-deps:
	@echo "Installing backend dependencies..."
	$(GO) mod download
	$(GO) mod tidy
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "Installing development tools..."
	@$(MAKE) install-tools

## install-tools: Install development tools
.PHONY: install-tools
install-tools:
	@echo "Installing goimports..."
	@command -v goimports >/dev/null 2>&1 || go install golang.org/x/tools/cmd/goimports@latest
	@echo "Installing migrate..."
	@command -v migrate >/dev/null 2>&1 || go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "Installing golangci-lint..."
	@command -v golangci-lint >/dev/null 2>&1 || curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.61.0
	@echo "Checking doctl..."
	@command -v doctl >/dev/null 2>&1 || echo "⚠️  Please install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/"
	@echo "Checking gh..."
	@command -v gh >/dev/null 2>&1 || echo "⚠️  Please install GitHub CLI: https://cli.github.com/"

## deps-update: Update all dependencies
.PHONY: deps-update
deps-update:
	$(GO) get -u ./...
	$(GO) mod tidy
	cd frontend && pnpm update

## env-setup: Create .env file from example
.PHONY: env-setup
env-setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env file created from .env.example"; \
		echo "📝 Please update .env with your configuration"; \
	else \
		echo "✅ .env file already exists"; \
	fi

## env-check: Check if .env file exists
.PHONY: env-check
env-check:
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file not found. Run 'make env-setup' first."; \
		exit 1; \
	fi

# =============================================================================
# Utility Commands
# =============================================================================

## logs: Show logs from Docker services
.PHONY: logs
logs:
	$(DOCKER_COMPOSE_LOCAL) logs -f

## clean-cache: Clear all caches
.PHONY: clean-cache
clean-cache:
	@echo "Clearing backend cache..."
	$(GO) clean -cache -modcache
	@echo "Clearing frontend cache..."
	cd frontend && rm -rf node_modules/.cache build .eslintcache
	@echo "✅ All caches cleared"

## docker-build: Build Docker image
.PHONY: docker-build
docker-build:
	docker build -t $(APP_NAME):latest .

## prod: Start production environment (requires .env.prod)
.PHONY: prod
prod:
	$(DOCKER_COMPOSE_PROD) up --build -d

## prod-stop: Stop production environment
.PHONY: prod-stop
prod-stop:
	$(DOCKER_COMPOSE_PROD) down

## prod-logs: Show production logs
.PHONY: prod-logs
prod-logs:
	$(DOCKER_COMPOSE_PROD) logs -f

# =============================================================================
# Internal/Helper Commands
# =============================================================================

.PHONY: env-check