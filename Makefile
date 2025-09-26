# Makefile for Thappy Project

# Variables
APP_NAME := thappy
DOCKER_COMPOSE := docker-compose
DOCKER := docker
GO := go
MIGRATE := migrate

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
.PHONY: help
help:
	@echo "Available commands:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'

## dev: Start development environment
.PHONY: dev
dev: env-check
	$(DOCKER_COMPOSE) up --build

## dev-detached: Start development environment in detached mode
.PHONY: dev-detached
dev-detached: env-check
	$(DOCKER_COMPOSE) up -d --build

## stop: Stop all services
.PHONY: stop
stop:
	$(DOCKER_COMPOSE) down

## clean: Stop services and remove volumes
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans
	$(DOCKER) system prune -f

## logs: Show logs from all services
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

## logs-api: Show logs from API service only
.PHONY: logs-api
logs-api:
	$(DOCKER_COMPOSE) logs -f api

## run-backend: Run backend API server directly (no Docker)
.PHONY: run-backend
run-backend:
	$(GO) run ./cmd/api

## run-frontend: Run frontend development server
.PHONY: run-frontend
run-frontend:
	cd frontend && pnpm start

## restart-backend: Kill and restart backend server
.PHONY: restart-backend
restart-backend:
	@echo "Stopping backend..."
	@pkill -f "go run ./cmd/api" || true
	@sleep 1
	@echo "Starting backend..."
	$(GO) run ./cmd/api

## restart-frontend: Kill and restart frontend server
.PHONY: restart-frontend
restart-frontend:
	@echo "Stopping frontend..."
	@pkill -f "pnpm start" || true
	@pkill -f "react-scripts start" || true
	@sleep 1
	@echo "Starting frontend..."
	cd frontend && pnpm start

## dev-local: Start both backend and frontend locally (no Docker)
.PHONY: dev-local
dev-local:
	@echo "Starting backend and frontend..."
	@make run-backend &
	@sleep 3
	@make run-frontend

## restart-all: Restart both backend and frontend
.PHONY: restart-all
restart-all:
	@echo "Restarting all services..."
	@pkill -f "go run ./cmd/api" || true
	@pkill -f "pnpm start" || true
	@pkill -f "react-scripts start" || true
	@sleep 2
	@echo "Starting backend..."
	@make run-backend &
	@sleep 3
	@echo "Starting frontend..."
	@make run-frontend

## stop-all: Stop all running services
.PHONY: stop-all
stop-all:
	./scripts/kill-processes.sh
	@sleep 2

## kill-frontend: Kill all frontend processes
.PHONY: kill-frontend
kill-frontend:
	@echo "Killing frontend processes..."
	@pkill -f "pnpm start" 2>/dev/null || true
	@pkill -f "react-scripts" 2>/dev/null || true
	@pkill -f "fork-ts-checker-webpack-plugin" 2>/dev/null || true
	@sleep 1

## kill-backend: Kill all backend processes
.PHONY: kill-backend
kill-backend:
	@echo "Killing backend processes..."
	@pkill -f "go run.*cmd/api" 2>/dev/null || true
	@sleep 1

## clear-frontend-cache: Clear React cache and node_modules cache
.PHONY: clear-frontend-cache
clear-frontend-cache:
	@echo "Clearing frontend cache..."
	@cd frontend && rm -rf node_modules/.cache .eslintcache build
	@echo "Frontend cache cleared"

## fix-ports: Fix hardcoded port references to use 8081
.PHONY: fix-ports
fix-ports:
	@echo "Fixing hardcoded port references..."
	@find frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/localhost:8080/localhost:8081/g'
	@echo "Port references updated to 8081"

## check-hardcoded-urls: Check for hardcoded API URLs that should use central config
.PHONY: check-hardcoded-urls
check-hardcoded-urls:
	@echo "Checking for hardcoded API URLs..."
	@echo "Files with hardcoded API_BASE_URL:"
	@grep -r "API_BASE_URL.*process.env" frontend/src --include="*.ts" --include="*.tsx" || echo "  None found"
	@echo "\nFiles with hardcoded localhost URLs:"
	@grep -r "localhost:" frontend/src --include="*.ts" --include="*.tsx" | grep -v constants.ts | grep -v testHelpers.ts | grep -v setupTests.ts || echo "  None found"
	@echo "\nUse 'make fix-hardcoded-urls' to automatically fix these issues"

## fix-hardcoded-urls: Fix hardcoded URLs to use centralized constants
.PHONY: fix-hardcoded-urls
fix-hardcoded-urls:
	@echo "Fixing hardcoded URLs to use centralized config..."
	@for file in $$(find frontend/src -name "*.ts" -o -name "*.tsx" | grep -v constants.ts | grep -v testHelpers.ts | grep -v setupTests.ts); do \
		if grep -q "API_BASE_URL.*process.env" "$$file"; then \
			echo "Fixing $$file"; \
			sed -i 's/const API_BASE_URL = process\.env\.REACT_APP_API_URL || .*//' "$$file"; \
			if ! grep -q "import.*API_BASE_URL.*constants" "$$file"; then \
				sed -i '1i import { API_BASE_URL } from '"'"'../utils/constants'"'"';\' "$$file"; \
			fi; \
		fi; \
	done
	@echo "Hardcoded URLs fixed"

## clean-start: Kill everything, clear cache, and start fresh
.PHONY: clean-start
clean-start: kill-frontend kill-backend clear-frontend-cache
	@echo "Starting fresh..."
	@sleep 1
	@echo "Starting backend..."
	@$(MAKE) run-backend > /dev/null 2>&1 &
	@sleep 3
	@echo "Starting frontend..."
	@$(MAKE) run-frontend

## status: Check status of services
.PHONY: status
status:
	@echo "Checking service status..."
	@echo "\nBackend (port 8081):"
	@curl -s http://localhost:8081/health | python3 -m json.tool 2>/dev/null || echo "  Not responding"
	@echo "\nFrontend (port 3004):"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3004 2>/dev/null || echo "  Not responding"
	@echo "\nRunning processes:"
	@ps aux | grep -E "(go run|pnpm|react-scripts)" | grep -v grep || echo "  No services running"

## build: Build the application
.PHONY: build
build:
	$(GO) build -o bin/$(APP_NAME) ./cmd/api

## test: Run all tests
.PHONY: test
test:
	$(GO) test -v -race -coverprofile=coverage.out ./...

## test-coverage: Run tests and show coverage report
.PHONY: test-coverage
test-coverage: test
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

## lint: Run linters
.PHONY: lint
lint:
	golangci-lint run ./...

## format: Format code
.PHONY: format
format:
	$(GO) fmt ./...
	goimports -w .

## mod-tidy: Clean up go modules
.PHONY: mod-tidy
mod-tidy:
	$(GO) mod tidy
	$(GO) mod verify

## migrate-up: Run database migrations up
.PHONY: migrate-up
migrate-up:
	$(DOCKER_COMPOSE) run --rm migrate

## migrate-down: Run database migrations down
.PHONY: migrate-down
migrate-down:
	$(DOCKER_COMPOSE) run --rm migrate -database "postgres://thappy:thappy_dev_password@postgres:5432/thappy?sslmode=disable" -path /migrations down

## migrate-create: Create a new migration file (usage: make migrate-create NAME=migration_name)
.PHONY: migrate-create
migrate-create:
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-create NAME=migration_name"; \
		exit 1; \
	fi
	$(MIGRATE) create -ext sql -dir migrations -seq $(NAME)

## db-shell: Connect to database shell
.PHONY: db-shell
db-shell:
	$(DOCKER_COMPOSE) exec postgres psql -U thappy -d thappy

## api-shell: Connect to API container shell
.PHONY: api-shell
api-shell:
	$(DOCKER_COMPOSE) exec api sh

## health: Check API health
.PHONY: health
health:
	@curl -s http://localhost:8080/health | python3 -m json.tool || echo "API not responding"

## docker-build: Build Docker image
.PHONY: docker-build
docker-build:
	$(DOCKER) build -t $(APP_NAME):latest .

## docker-run: Run Docker image locally
.PHONY: docker-run
docker-run:
	$(DOCKER) run --rm -p 8080:8080 --env-file .env $(APP_NAME):latest

## setup: Initial project setup
.PHONY: setup
setup: env-setup mod-tidy
	@echo "Project setup complete!"

## env-setup: Create .env file from example
.PHONY: env-setup
env-setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env file created from .env.example"; \
		echo "Please update .env with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

## env-check: Check if .env file exists
.PHONY: env-check
env-check:
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Run 'make env-setup' first."; \
		exit 1; \
	fi

## install-tools: Install development tools
.PHONY: install-tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "Development tools installed!"

## benchmark: Run benchmarks
.PHONY: benchmark
benchmark:
	$(GO) test -bench=. -benchmem ./...

## security: Run security checks
.PHONY: security
security:
	gosec ./...

## deps-update: Update dependencies
.PHONY: deps-update
deps-update:
	$(GO) get -u ./...
	$(GO) mod tidy

## api-test: Test API endpoints manually
.PHONY: api-test
api-test:
	@echo "Testing registration..."
	@curl -X POST http://localhost:8080/api/register \
		-H "Content-Type: application/json" \
		-d '{"email":"test@example.com","password":"TestPass123!"}' | python3 -m json.tool
	@echo "\nTesting login..."
	@curl -X POST http://localhost:8080/api/login \
		-H "Content-Type: application/json" \
		-d '{"email":"test@example.com","password":"TestPass123!"}' | python3 -m json.tool

## production-build: Build for production
.PHONY: production-build
production-build:
	CGO_ENABLED=0 GOOS=linux $(GO) build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o bin/$(APP_NAME) ./cmd/api

## ci: Run CI pipeline locally
.PHONY: ci
ci: format lint test

## all-tests: Run all tests including integration
.PHONY: all-tests
all-tests: test
	@echo "Running integration tests..."
	$(GO) test -tags=integration ./test/integration/...

## frontend-install: Install frontend dependencies
.PHONY: frontend-install
frontend-install:
	cd frontend && pnpm install

## frontend-dev: Start frontend development server
.PHONY: frontend-dev
frontend-dev:
	cd frontend && pnpm start

## frontend-restart: Restart frontend development server (kills existing and starts fresh)
.PHONY: frontend-restart
frontend-restart:
	cd frontend && pnpm run restart

## frontend-restart-fresh: Restart frontend with cache clearing
.PHONY: frontend-restart-fresh
frontend-restart-fresh:
	cd frontend && pnpm run restart:fresh

## frontend-build: Build frontend for production
.PHONY: frontend-build
frontend-build:
	cd frontend && pnpm run build

## frontend-test: Run frontend tests
.PHONY: frontend-test
frontend-test:
	cd frontend && pnpm test -- --coverage --watchAll=false

## frontend-lint: Lint frontend code
.PHONY: frontend-lint
frontend-lint:
	cd frontend && pnpm run lint

## frontend-lint-fix: Fix frontend linting issues
.PHONY: frontend-lint-fix
frontend-lint-fix:
	cd frontend && pnpm run lint:fix

## frontend-format: Format frontend code
.PHONY: frontend-format
frontend-format:
	cd frontend && pnpm run format

## frontend-format-check: Check frontend code formatting
.PHONY: frontend-format-check
frontend-format-check:
	cd frontend && pnpm run format:check

## frontend-type-check: Run TypeScript type checking
.PHONY: frontend-type-check
frontend-type-check:
	cd frontend && pnpm run type-check

## frontend-clean: Clean frontend cache and reinstall
.PHONY: frontend-clean
frontend-clean:
	cd frontend && pnpm run clean

## dev-full: Start both backend and frontend
.PHONY: dev-full
dev-full:
	make dev-detached
	sleep 5
	make frontend-dev

## dev-restart: Restart both backend and frontend
.PHONY: dev-restart
dev-restart:
	make dev-detached
	sleep 3
	make frontend-restart

## build-all: Build both backend and frontend
.PHONY: build-all
build-all: build frontend-build

## clean-all: Clean both backend and frontend
.PHONY: clean-all
clean-all: clean
	cd frontend && rm -rf node_modules build pnpm-lock.yaml

## frontend-ci: Run frontend CI pipeline (lint, format, type-check, test)
.PHONY: frontend-ci
frontend-ci: frontend-lint frontend-format-check frontend-type-check frontend-test

## ci-all: Run CI pipeline for both backend and frontend
.PHONY: ci-all
ci-all: ci frontend-ci

## dev-frontend-only: Start only frontend in development mode
.PHONY: dev-frontend-only
dev-frontend-only: frontend-install
	make frontend-dev

## production-frontend: Build frontend for production
.PHONY: production-frontend
production-frontend:
	cd frontend && pnpm install --prod && pnpm run build