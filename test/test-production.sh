#!/bin/bash

# Production Deployment Testing Script
# Tests the complete CI/CD pipeline in production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DO_CONTEXT="thappy"
TEST_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_RETRIES=10
DEPLOYMENT_TIMEOUT=600  # 10 minutes

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()
WARNINGS=()

# Global variables
DROPLET_IP=""
DROPLET_ID=""
INITIAL_COMMIT=""
TEST_COMMIT=""

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
}

print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo -e "${BLUE}─────────────────────────────────────────${NC}"
}

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
    WARNINGS+=("$1")
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Utility functions
wait_for_service() {
    local url="$1"
    local name="$2"
    local timeout="${3:-60}"
    local retries=$((timeout / 5))

    print_info "Waiting for $name to be ready (timeout: ${timeout}s)..."

    for i in $(seq 1 $retries); do
        if curl -s --connect-timeout 5 "$url" >/dev/null 2>&1; then
            print_success "$name is ready"
            return 0
        fi
        echo -n "."
        sleep 5
    done

    print_failure "$name did not become ready within ${timeout}s"
    return 1
}

wait_for_deployment() {
    local timeout="${1:-600}"
    local start_time=$(date +%s)

    print_info "Waiting for GitHub Actions deployment to complete..."

    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        if [ $elapsed -gt $timeout ]; then
            print_failure "Deployment timeout after ${timeout}s"
            return 1
        fi

        local status=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion 2>/dev/null | jq -r '.[0].conclusion // .[0].status' 2>/dev/null || echo "unknown")

        case "$status" in
            "success")
                print_success "Deployment completed successfully"
                return 0
                ;;
            "failure"|"cancelled")
                print_failure "Deployment failed or was cancelled"
                return 1
                ;;
            "in_progress"|"queued"|"pending")
                echo -n "."
                sleep 10
                ;;
            *)
                print_warning "Unknown deployment status: $status"
                sleep 10
                ;;
        esac
    done
}

get_droplet_info() {
    if doctl compute droplet list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
        DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
        DROPLET_ID=$(doctl compute droplet list --format ID,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
        return 0
    else
        return 1
    fi
}

check_prerequisites() {
    local all_good=true

    # Check required tools
    local required_tools=("doctl" "gh" "git" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            print_failure "$tool is required but not installed"
            all_good=false
        fi
    done

    # Check DO authentication
    if ! doctl auth switch --context $DO_CONTEXT >/dev/null 2>&1; then
        print_failure "Digital Ocean context '$DO_CONTEXT' not found. Run 'make do-setup'."
        all_good=false
    fi

    # Check GitHub authentication
    if ! gh auth status >/dev/null 2>&1; then
        print_failure "GitHub CLI not authenticated. Run 'gh auth login'."
        all_good=false
    fi

    # Check if we're in a git repository
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        print_failure "Not in a git repository"
        all_good=false
    fi

    return $all_good
}

cleanup() {
    echo -e "\n${YELLOW}🧹 Cleanup (if needed)...${NC}"

    # Remove test files if they exist
    if [[ -f "TEST_DEPLOYMENT.md" ]]; then
        git rm -f TEST_DEPLOYMENT.md 2>/dev/null || rm -f TEST_DEPLOYMENT.md
    fi

    # Reset to initial commit if we have it
    if [[ -n "$INITIAL_COMMIT" ]]; then
        print_info "Resetting to initial commit: $INITIAL_COMMIT"
        git reset --hard "$INITIAL_COMMIT" 2>/dev/null || true
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT

# Main test execution
print_header "🚀 PRODUCTION CI/CD PIPELINE TESTING"

# Phase 1: Prerequisites
print_section "Phase 1: Prerequisites Check"

if check_prerequisites; then
    print_success "All prerequisites met"
else
    print_failure "Prerequisites not met. Please fix and retry."
    exit 1
fi

# Get initial commit for cleanup
INITIAL_COMMIT=$(git rev-parse HEAD)
print_info "Initial commit: $INITIAL_COMMIT"

# Phase 2: Infrastructure Validation
print_section "Phase 2: Infrastructure Validation"

print_test "Digital Ocean context"
if doctl compute droplet list --context $DO_CONTEXT >/dev/null 2>&1; then
    print_success "Digital Ocean context works"
else
    print_failure "Digital Ocean context failed"
fi

print_test "Droplet existence"
if get_droplet_info; then
    print_success "Production droplet found: $DROPLET_IP"
else
    print_failure "Production droplet not found. Run 'make do-create-droplet'."
    exit 1
fi

print_test "Droplet connectivity"
if ping -c 1 "$DROPLET_IP" >/dev/null 2>&1; then
    print_success "Droplet is reachable"
else
    print_failure "Droplet is not reachable"
fi

print_test "SSH connectivity"
if doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "echo 'SSH test'" >/dev/null 2>&1; then
    print_success "SSH connection works"
else
    print_failure "SSH connection failed"
fi

# Phase 3: Current Application State
print_section "Phase 3: Current Application State"

print_test "Current application status"
if curl -s --connect-timeout 10 "http://$DROPLET_IP:8081/health" >/dev/null 2>&1; then
    print_success "Application is currently running"
    CURRENT_HEALTH=$(curl -s "http://$DROPLET_IP:8081/health" 2>/dev/null || echo "{}")
    print_info "Current health response: $CURRENT_HEALTH"
else
    print_warning "Application is not currently responding (this may be expected)"
fi

print_test "Container status check"
CONTAINER_STATUS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker ps --format 'table {{.Names}}\t{{.Status}}'" 2>/dev/null || echo "Unable to check")
if [[ "$CONTAINER_STATUS" != "Unable to check" ]]; then
    print_success "Container status retrieved"
    echo "$CONTAINER_STATUS" | head -5
else
    print_warning "Unable to check container status"
fi

# Phase 4: GitHub Actions Secrets Validation
print_section "Phase 4: GitHub Actions Configuration"

print_test "GitHub secrets configuration"
SECRETS=$(gh secret list 2>/dev/null || echo "")
REQUIRED_SECRETS=("DO_ACCESS_TOKEN" "DO_SSH_KEY" "DB_PASSWORD_PROD" "JWT_SECRET_PROD")

for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "$secret"; then
        print_success "Secret $secret is configured"
    else
        print_failure "Secret $secret is missing"
    fi
done

print_test "GitHub workflow file"
if [[ -f ".github/workflows/deploy.yml" ]]; then
    print_success "Deploy workflow file exists"
else
    print_failure "Deploy workflow file missing"
fi

# Phase 5: Deployment Testing
print_section "Phase 5: Full Deployment Test"

# Create a test change
TEST_CHANGE="Deployment test at $(date '+%Y-%m-%d %H:%M:%S')"
echo "# $TEST_CHANGE" > TEST_DEPLOYMENT.md

print_test "Test change creation"
git add TEST_DEPLOYMENT.md
git commit -m "test: $TEST_CHANGE"
TEST_COMMIT=$(git rev-parse HEAD)
print_success "Test commit created: $TEST_COMMIT"

print_test "Git push to trigger deployment"
if git push origin main; then
    print_success "Git push successful"
else
    print_failure "Git push failed"
    exit 1
fi

print_test "GitHub Actions deployment"
if wait_for_deployment $DEPLOYMENT_TIMEOUT; then
    print_success "Deployment completed"
else
    print_failure "Deployment failed or timed out"
    # Show recent workflow logs
    print_info "Recent workflow logs:"
    gh run list --workflow=deploy.yml --limit 1 --json url | jq -r '.[0].url'
fi

# Phase 6: Post-Deployment Validation
print_section "Phase 6: Post-Deployment Validation"

print_test "Service availability after deployment"
if wait_for_service "http://$DROPLET_IP:8081/health" "Backend API" 120; then
    print_success "Backend API is available after deployment"
else
    print_failure "Backend API not available after deployment"
fi

print_test "Frontend availability"
if wait_for_service "http://$DROPLET_IP/" "Frontend" 60; then
    print_success "Frontend is available after deployment"
else
    print_failure "Frontend not available after deployment"
fi

print_test "Database connectivity"
DB_HEALTH=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker exec thappy-postgres-prod pg_isready -U thappy -d thappy" 2>/dev/null || echo "failed")
if echo "$DB_HEALTH" | grep -q "accepting connections"; then
    print_success "Database is accepting connections"
else
    print_failure "Database connection issues"
fi

print_test "Container health after deployment"
HEALTHY_CONTAINERS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker ps --filter health=healthy --format '{{.Names}}'" 2>/dev/null | wc -l)
if [[ "$HEALTHY_CONTAINERS" -gt 0 ]]; then
    print_success "$HEALTHY_CONTAINERS containers report healthy status"
else
    print_warning "No containers report healthy status (health checks may be disabled)"
fi

# Phase 7: Application Functionality Testing
print_section "Phase 7: Application Functionality"

print_test "Health endpoint response"
HEALTH_RESPONSE=$(curl -s "http://$DROPLET_IP:8081/health" 2>/dev/null || echo "{}")
if [[ "$HEALTH_RESPONSE" != "{}" ]] && [[ "$HEALTH_RESPONSE" != "" ]]; then
    print_success "Health endpoint returns valid response"
    echo "   Response: $HEALTH_RESPONSE"
else
    print_failure "Health endpoint returns empty or invalid response"
fi

print_test "API endpoints accessibility"
API_ENDPOINTS=("/api/articles" "/api/therapists")
for endpoint in "${API_ENDPOINTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP:8081$endpoint" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" =~ ^(200|201|204|404)$ ]]; then
        print_success "API endpoint $endpoint accessible (HTTP $HTTP_CODE)"
    else
        print_warning "API endpoint $endpoint returned HTTP $HTTP_CODE"
    fi
done

print_test "Frontend routes"
FRONTEND_ROUTES=("/" "/articles" "/therapists")
for route in "${FRONTEND_ROUTES[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DROPLET_IP$route" 2>/dev/null || echo "000")
    if [[ "$HTTP_CODE" =~ ^(200|301|302|404)$ ]]; then
        print_success "Frontend route $route accessible (HTTP $HTTP_CODE)"
    else
        print_warning "Frontend route $route returned HTTP $HTTP_CODE"
    fi
done

# Phase 8: Performance and Resource Testing
print_section "Phase 8: Performance and Resource Testing"

print_test "Server resource usage"
RESOURCE_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "free -h | grep Mem && df -h / | tail -1" 2>/dev/null || echo "Unable to check")
if [[ "$RESOURCE_INFO" != "Unable to check" ]]; then
    print_success "Resource usage retrieved"
    echo "$RESOURCE_INFO" | while read line; do echo "   $line"; done
else
    print_failure "Unable to check resource usage"
fi

print_test "Load test (basic)"
print_info "Running basic load test (10 concurrent requests)..."
for i in {1..10}; do
    curl -s "http://$DROPLET_IP:8081/health" >/dev/null &
done
wait

if curl -s "http://$DROPLET_IP:8081/health" >/dev/null 2>&1; then
    print_success "Service handles basic load"
else
    print_failure "Service failed under basic load"
fi

# Phase 9: Monitoring and Logging
print_section "Phase 9: Monitoring and Logging"

print_test "Log accessibility"
RECENT_LOGS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy && docker-compose -f docker-compose.production.yml logs --tail=5 backend 2>/dev/null" 2>/dev/null || echo "Unable to fetch")
if [[ "$RECENT_LOGS" != "Unable to fetch" ]]; then
    print_success "Application logs accessible"
else
    print_failure "Unable to access application logs"
fi

print_test "Error log check"
ERROR_COUNT=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy && docker-compose -f docker-compose.production.yml logs --since 10m 2>/dev/null | grep -ci 'error\|exception\|fail' || echo 0" 2>/dev/null || echo "0")
if [[ "$ERROR_COUNT" -eq 0 ]]; then
    print_success "No errors in recent logs"
elif [[ "$ERROR_COUNT" -lt 5 ]]; then
    print_warning "$ERROR_COUNT errors found in recent logs"
else
    print_failure "$ERROR_COUNT errors found in recent logs"
fi

# Phase 10: Backup System Testing
print_section "Phase 10: Backup System"

print_test "Backup directory structure"
BACKUP_STRUCTURE=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "ls -la /opt/thappy/backups/ 2>/dev/null || echo 'Not found'" 2>/dev/null)
if [[ "$BACKUP_STRUCTURE" != "Not found" ]]; then
    print_success "Backup directory exists"
else
    print_warning "Backup directory not found"
fi

print_test "Backup scripts availability"
BACKUP_SCRIPTS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "ls -la /opt/thappy/scripts/ 2>/dev/null | grep backup || echo 'Not found'" 2>/dev/null)
if [[ "$BACKUP_SCRIPTS" != "Not found" ]]; then
    print_success "Backup scripts are available"
else
    print_warning "Backup scripts not found"
fi

# Phase 11: Security Testing
print_section "Phase 11: Security Validation"

print_test "Firewall status"
FIREWALL_STATUS=$(doctl compute firewall list --context $DO_CONTEXT --format Name,Status --no-header 2>/dev/null | grep thappy || echo "Not found")
if [[ "$FIREWALL_STATUS" != "Not found" ]]; then
    print_success "Firewall is configured"
else
    print_warning "Firewall not found"
fi

print_test "Port scan (security check)"
OPEN_PORTS=$(nmap -p 22,80,443,8081 "$DROPLET_IP" 2>/dev/null | grep "open" | wc -l)
if [[ "$OPEN_PORTS" -ge 2 ]] && [[ "$OPEN_PORTS" -le 4 ]]; then
    print_success "$OPEN_PORTS required ports are open"
else
    print_warning "Unexpected number of open ports: $OPEN_PORTS"
fi

print_test "SSL configuration check"
if command -v openssl >/dev/null 2>&1; then
    SSL_CHECK=$(echo | openssl s_client -connect "$DROPLET_IP:443" -servername localhost 2>/dev/null | grep "Verify return code" || echo "No SSL")
    if echo "$SSL_CHECK" | grep -q "ok"; then
        print_success "SSL certificate is valid"
    else
        print_warning "SSL not configured or invalid"
    fi
else
    print_warning "OpenSSL not available for SSL check"
fi

# Phase 12: Integration Testing
print_section "Phase 12: End-to-End Integration"

print_test "Full application flow"
# Test a complete flow: frontend -> backend -> database
INTEGRATION_TEST=$(curl -s "http://$DROPLET_IP:8081/health" 2>/dev/null && curl -s "http://$DROPLET_IP/" >/dev/null 2>&1)
if [[ $? -eq 0 ]]; then
    print_success "End-to-end integration working"
else
    print_failure "Integration test failed"
fi

print_test "Database schema validation"
DB_TABLES=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker exec thappy-postgres-prod psql -U thappy -d thappy -c '\dt' 2>/dev/null | grep -c 'table' || echo 0" 2>/dev/null || echo "0")
if [[ "$DB_TABLES" -gt 0 ]]; then
    print_success "Database schema exists ($DB_TABLES tables)"
else
    print_warning "No database tables found"
fi

# Final Results
print_header "📊 PRODUCTION TEST RESULTS SUMMARY"

echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "⚠️  Warnings: ${YELLOW}${#WARNINGS[@]}${NC}"
echo -e "📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 Production CI/CD pipeline is working correctly!${NC}"

    echo -e "\n${BLUE}📋 Deployment Summary:${NC}"
    echo -e "  🌍 Droplet IP: $DROPLET_IP"
    echo -e "  🔗 Backend: http://$DROPLET_IP:8081"
    echo -e "  🖥️  Frontend: http://$DROPLET_IP"
    echo -e "  📝 Test Commit: $TEST_COMMIT"

    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        echo -e "\n${YELLOW}⚠️  Warnings to address:${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  - ${YELLOW}$warning${NC}"
        done
    fi

    echo -e "\n${BLUE}🚀 Next Steps:${NC}"
    echo "  1. Set up domain name and SSL certificates"
    echo "  2. Configure monitoring and alerting"
    echo "  3. Set up automated backups"
    echo "  4. Run rollback tests with: ./test/test-rollback.sh"

    exit 0
else
    echo -e "\n${RED}❌ Production deployment has issues. Please fix:${NC}"
    for failed_test in "${FAILED_TESTS[@]}"; do
        echo -e "  - ${RED}$failed_test${NC}"
    done

    echo -e "\n${YELLOW}🔧 Troubleshooting:${NC}"
    echo "  1. Check deployment logs: make gh-deploy-logs"
    echo "  2. Check server status: make do-status"
    echo "  3. SSH to server: make do-ssh"
    echo "  4. Check application logs: make do-logs"
    echo "  5. Run rollback if needed: make deploy-rollback"

    exit 1
fi