#!/bin/bash

# Local Development Testing Script
# Tests the CI/CD pipeline components locally before production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Helper functions
print_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1")
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

run_test() {
    local test_name="$1"
    local test_command="$2"

    print_test "$test_name"

    if eval "$test_command" >/dev/null 2>&1; then
        print_success "$test_name"
        return 0
    else
        print_failure "$test_name"
        return 1
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up test processes...${NC}"
    pkill -f "go run.*cmd/api" 2>/dev/null || true
    pkill -f "pnpm start" 2>/dev/null || true
    docker-compose -f docker-compose.yml down -v 2>/dev/null || true
    docker-compose -f docker-compose.production.yml down -v 2>/dev/null || true
}

# Trap cleanup on script exit
trap cleanup EXIT

echo "🚀 Starting Local CI/CD Pipeline Tests"
echo "========================================"

# Phase 1: Prerequisites
echo -e "\n${BLUE}📋 Phase 1: Prerequisites${NC}"

print_test "Project structure"
if [[ -f "Makefile" && -f "docker-compose.yml" && -f "docker-compose.production.yml" ]]; then
    print_success "Project structure valid"
else
    print_failure "Missing required files"
fi

run_test "Make available" "command -v make"
run_test "Docker available" "command -v docker"
run_test "Docker Compose available" "command -v docker-compose"
run_test "Go available" "command -v go"
run_test "Node.js available" "command -v node"
run_test "pnpm available" "command -v pnpm"

# Optional tools
if command -v doctl >/dev/null 2>&1; then
    print_success "doctl available"
else
    print_warning "doctl not found (optional for local testing)"
fi

if command -v gh >/dev/null 2>&1; then
    print_success "gh CLI available"
else
    print_warning "GitHub CLI not found (optional for local testing)"
fi

# Phase 2: Project Setup
echo -e "\n${BLUE}📦 Phase 2: Project Setup${NC}"

print_test "Environment setup"
if make env-setup >/dev/null 2>&1; then
    print_success "Environment setup"
else
    print_failure "Environment setup failed"
fi

print_test "Dependencies installation"
if make install-deps >/dev/null 2>&1; then
    print_success "Dependencies installed"
else
    print_failure "Dependencies installation failed"
fi

# Phase 3: Code Quality
echo -e "\n${BLUE}🔍 Phase 3: Code Quality${NC}"

print_test "Backend formatting check"
if make format-check >/dev/null 2>&1; then
    print_success "Backend formatting"
else
    print_info "Running auto-format and re-checking..."
    if make format >/dev/null 2>&1 && make format-check >/dev/null 2>&1; then
        print_success "Backend formatting (after auto-fix)"
    else
        print_failure "Backend formatting issues"
    fi
fi

print_test "Frontend type checking"
if make type-check >/dev/null 2>&1; then
    print_success "TypeScript types valid"
else
    print_failure "TypeScript type errors"
fi

print_test "Linting"
if make lint >/dev/null 2>&1; then
    print_success "Linting passed"
else
    print_failure "Linting issues found"
fi

# Phase 4: Testing
echo -e "\n${BLUE}🧪 Phase 4: Unit Tests${NC}"

print_test "Backend tests"
if make test-backend >/dev/null 2>&1; then
    print_success "Backend tests passed"
else
    print_failure "Backend tests failed"
fi

print_test "Frontend tests"
if make test-frontend >/dev/null 2>&1; then
    print_success "Frontend tests passed"
else
    print_failure "Frontend tests failed"
fi

# Phase 5: Build Testing
echo -e "\n${BLUE}🔨 Phase 5: Build Testing${NC}"

print_test "Backend build"
if make build >/dev/null 2>&1; then
    print_success "Backend builds successfully"
    # Check if binary exists and is executable
    if [[ -f "bin/thappy" && -x "bin/thappy" ]]; then
        print_success "Backend binary created"
    else
        print_failure "Backend binary not created"
    fi
else
    print_failure "Backend build failed"
fi

print_test "Frontend build"
if make build-all >/dev/null 2>&1; then
    print_success "Frontend builds successfully"
    # Check if build directory exists
    if [[ -d "frontend/build" ]]; then
        print_success "Frontend build directory created"
    else
        print_failure "Frontend build directory not found"
    fi
else
    print_failure "Frontend build failed"
fi

# Phase 6: Docker Testing
echo -e "\n${BLUE}🐳 Phase 6: Docker Testing${NC}"

print_test "Docker image build"
if make docker-build >/dev/null 2>&1; then
    print_success "Docker images build successfully"
else
    print_failure "Docker image build failed"
fi

print_test "Docker Compose validation"
if docker-compose -f docker-compose.yml config >/dev/null 2>&1; then
    print_success "docker-compose.yml valid"
else
    print_failure "docker-compose.yml validation failed"
fi

print_test "Production Docker Compose validation"
if docker-compose -f docker-compose.production.yml config >/dev/null 2>&1; then
    print_success "docker-compose.production.yml valid"
else
    print_failure "docker-compose.production.yml validation failed"
fi

# Phase 7: Local Development Environment
echo -e "\n${BLUE}🚀 Phase 7: Development Environment${NC}"

print_info "Starting local development environment..."

# Start backend
print_test "Backend startup"
make run-backend >/dev/null 2>&1 &
BACKEND_PID=$!
sleep 5

if curl -s http://localhost:8081/health >/dev/null 2>&1; then
    print_success "Backend starts and responds"
    BACKEND_RESPONSE=$(curl -s http://localhost:8081/health)
    if echo "$BACKEND_RESPONSE" | grep -q "status\|health\|ok" 2>/dev/null; then
        print_success "Backend health endpoint returns valid response"
    else
        print_warning "Backend health endpoint response format unknown"
    fi
else
    print_failure "Backend not responding"
fi

# Test backend endpoints
print_test "Backend API endpoints"
if curl -s http://localhost:8081/api/articles >/dev/null 2>&1; then
    print_success "Articles API endpoint accessible"
else
    print_warning "Articles API endpoint not responding (may be expected)"
fi

if curl -s http://localhost:8081/api/therapists >/dev/null 2>&1; then
    print_success "Therapists API endpoint accessible"
else
    print_warning "Therapists API endpoint not responding (may be expected)"
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null || true
sleep 2

# Phase 8: Container Environment Testing
echo -e "\n${BLUE}📦 Phase 8: Container Environment${NC}"

print_info "Testing containerized environment..."

# Start production environment locally
print_test "Production environment startup"
if make prod >/dev/null 2>&1; then
    sleep 15

    if curl -s http://localhost:8081/health >/dev/null 2>&1; then
        print_success "Production containers start successfully"
    else
        print_failure "Production containers not responding"
    fi

    # Test container health
    print_test "Container health checks"
    if docker ps | grep -q "thappy.*healthy\|thappy.*Up"; then
        print_success "Containers report healthy status"
    else
        print_warning "Container health status unclear"
    fi

    # Test frontend in production mode
    print_test "Frontend production build"
    if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend serves in production mode"
    else
        print_warning "Frontend not accessible (check port configuration)"
    fi

    # Stop production environment
    make prod-stop >/dev/null 2>&1
else
    print_failure "Production environment failed to start"
fi

# Phase 9: Makefile Commands Testing
echo -e "\n${BLUE}⚙️ Phase 9: Makefile Commands${NC}"

# Test essential make commands
MAKE_COMMANDS=(
    "help"
    "clean"
    "status"
)

for cmd in "${MAKE_COMMANDS[@]}"; do
    print_test "make $cmd"
    if make "$cmd" >/dev/null 2>&1; then
        print_success "make $cmd works"
    else
        print_failure "make $cmd failed"
    fi
done

# Test CI command
print_test "Complete CI pipeline"
if make ci >/dev/null 2>&1; then
    print_success "Complete CI pipeline passes"
else
    print_failure "CI pipeline has issues"
fi

# Phase 10: GitHub Actions Workflow Validation
echo -e "\n${BLUE}🐙 Phase 10: GitHub Actions Validation${NC}"

print_test "GitHub Actions workflow syntax"
if [[ -f ".github/workflows/deploy.yml" ]]; then
    # Basic YAML syntax check
    if command -v yamllint >/dev/null 2>&1; then
        if yamllint .github/workflows/deploy.yml >/dev/null 2>&1; then
            print_success "GitHub Actions workflow YAML valid"
        else
            print_warning "YAML syntax issues (install yamllint for detailed checking)"
        fi
    else
        # Basic check for required fields
        if grep -q "name:\|on:\|jobs:" .github/workflows/deploy.yml; then
            print_success "GitHub Actions workflow structure looks valid"
        else
            print_failure "GitHub Actions workflow missing required fields"
        fi
    fi
else
    print_failure "GitHub Actions workflow file missing"
fi

# Phase 11: Documentation and Scripts
echo -e "\n${BLUE}📚 Phase 11: Documentation and Scripts${NC}"

REQUIRED_DOCS=(
    "CLI_COMMANDS.md"
    "TESTING_CICD.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    print_test "$doc exists"
    if [[ -f "$doc" ]]; then
        print_success "$doc found"
    else
        print_failure "$doc missing"
    fi
done

REQUIRED_SCRIPTS=(
    "deploy/setup-droplet.sh"
    "deploy/monitor.sh"
    "deploy/backup.sh"
    "deploy/status.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    print_test "$script executable"
    if [[ -f "$script" && -x "$script" ]]; then
        print_success "$script is executable"
    else
        print_failure "$script missing or not executable"
    fi
done

# Final Results
echo -e "\n${BLUE}📊 Test Results Summary${NC}"
echo "========================================"
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your CI/CD pipeline is ready for production testing.${NC}"

    echo -e "\n${BLUE}📋 Next Steps:${NC}"
    echo "1. Set up Digital Ocean authentication: doctl auth init --context thappy"
    echo "2. Set up GitHub CLI authentication: gh auth login"
    echo "3. Run production infrastructure tests: make do-setup"
    echo "4. Deploy to production: make setup-production"

    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please fix the following issues:${NC}"
    for failed_test in "${FAILED_TESTS[@]}"; do
        echo -e "  - ${RED}$failed_test${NC}"
    done

    echo -e "\n${YELLOW}🔧 Common fixes:${NC}"
    echo "  - Run 'make install-deps' to install missing dependencies"
    echo "  - Run 'make format' to fix formatting issues"
    echo "  - Check error logs with 'make logs'"
    echo "  - Ensure all required tools are installed"

    exit 1
fi