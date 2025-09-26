# Makefile for Thappy Project
# Professional, clean, and simple - following CLAUDE.md guidelines

# =============================================================================
# Variables
# =============================================================================

APP_NAME := thappy
DOCKER_COMPOSE := docker-compose
DOCKER_COMPOSE_LOCAL := docker-compose -f docker-compose.local.yml
DOCKER_COMPOSE_PROD := docker-compose -f docker-compose.prod.yml
GO := go
BACKEND_PORT := 8081
FRONTEND_PORT := 3004

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