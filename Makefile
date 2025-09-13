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
	cd frontend && npm install

## frontend-dev: Start frontend development server
.PHONY: frontend-dev
frontend-dev:
	cd frontend && npm start

## frontend-build: Build frontend for production
.PHONY: frontend-build
frontend-build:
	cd frontend && npm run build

## frontend-test: Run frontend tests
.PHONY: frontend-test
frontend-test:
	cd frontend && npm test -- --coverage --watchAll=false

## dev-full: Start both backend and frontend
.PHONY: dev-full
dev-full:
	make dev-detached
	sleep 5
	make frontend-dev

## build-all: Build both backend and frontend
.PHONY: build-all
build-all: build frontend-build

## clean-all: Clean both backend and frontend
.PHONY: clean-all
clean-all: clean
	cd frontend && rm -rf node_modules build