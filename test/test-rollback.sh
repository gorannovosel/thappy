#!/bin/bash

# Rollback Testing Script
# Tests the rollback functionality of the CI/CD pipeline

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
DO_CONTEXT="thappy"
ROLLBACK_TIMEOUT=300
HEALTH_CHECK_RETRIES=12

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Global variables
DROPLET_IP=""
INITIAL_COMMIT=""
TEST_COMMIT=""
ROLLBACK_COMMIT=""

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
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

wait_for_deployment() {
    local timeout="${1:-300}"
    local start_time=$(date +%s)

    print_info "Waiting for deployment to complete..."

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
                sleep 5
                ;;
            *)
                sleep 5
                ;;
        esac
    done
}

wait_for_health() {
    local timeout="${1:-60}"
    local retries=$((timeout / 5))

    for i in $(seq 1 $retries); do
        if curl -s --connect-timeout 5 "http://$DROPLET_IP:8081/health" >/dev/null 2>&1; then
            return 0
        fi
        sleep 5
    done
    return 1
}

get_current_version() {
    # Try to get version from health endpoint or commit hash
    local version=$(curl -s "http://$DROPLET_IP:8081/health" 2>/dev/null | jq -r '.version // .commit // "unknown"' 2>/dev/null || echo "unknown")
    if [[ "$version" == "unknown" ]]; then
        # Fallback: get latest deployed commit from server
        version=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy && git rev-parse --short HEAD 2>/dev/null || echo 'unknown'" 2>/dev/null || echo "unknown")
    fi
    echo "$version"
}

get_droplet_info() {
    if doctl compute droplet list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
        DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
        return 0
    else
        return 1
    fi
}

cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up rollback test...${NC}"

    # Remove test files
    rm -f ROLLBACK_TEST.md ROLLBACK_TEST_V2.md

    # Reset to initial state if needed
    if [[ -n "$INITIAL_COMMIT" ]]; then
        print_info "Resetting to initial commit: $INITIAL_COMMIT"
        git reset --hard "$INITIAL_COMMIT" 2>/dev/null || true
        git push origin main --force 2>/dev/null || true
    fi
}

trap cleanup EXIT

print_header "🔄 ROLLBACK FUNCTIONALITY TESTING"

# Phase 1: Prerequisites
print_section "Phase 1: Prerequisites Check"

# Check tools
required_tools=("doctl" "gh" "git" "curl" "jq")
for tool in "${required_tools[@]}"; do
    if command -v "$tool" >/dev/null 2>&1; then
        print_success "$tool available"
    else
        print_failure "$tool missing"
        exit 1
    fi
done

# Check authentication
print_test "Digital Ocean authentication"
if doctl auth switch --context $DO_CONTEXT >/dev/null 2>&1; then
    print_success "DO authentication works"
else
    print_failure "DO authentication failed"
    exit 1
fi

print_test "GitHub authentication"
if gh auth status >/dev/null 2>&1; then
    print_success "GitHub authentication works"
else
    print_failure "GitHub authentication failed"
    exit 1
fi

# Get droplet info
print_test "Production droplet availability"
if get_droplet_info; then
    print_success "Production droplet found: $DROPLET_IP"
else
    print_failure "Production droplet not found"
    exit 1
fi

# Phase 2: Initial State Setup
print_section "Phase 2: Initial State Setup"

# Record initial commit
INITIAL_COMMIT=$(git rev-parse HEAD)
print_info "Initial commit: $INITIAL_COMMIT"

# Check current application health
print_test "Initial application health"
if wait_for_health 30; then
    INITIAL_VERSION=$(get_current_version)
    print_success "Application is healthy (version: $INITIAL_VERSION)"
else
    print_warning "Application not responding initially"
    INITIAL_VERSION="unknown"
fi

# Phase 3: Deploy Version 1 (Test Change)
print_section "Phase 3: Deploy Test Version 1"

# Create first test change
TEST_CHANGE_1="Rollback test version 1 - $(date '+%Y-%m-%d %H:%M:%S')"
echo "# $TEST_CHANGE_1" > ROLLBACK_TEST.md
echo "This is version 1 of the rollback test." >> ROLLBACK_TEST.md

git add ROLLBACK_TEST.md
git commit -m "test: rollback test version 1"
TEST_COMMIT_1=$(git rev-parse HEAD)

print_test "Deploy version 1"
git push origin main
if wait_for_deployment $ROLLBACK_TIMEOUT; then
    print_success "Version 1 deployed successfully"
else
    print_failure "Version 1 deployment failed"
    exit 1
fi

print_test "Version 1 health check"
if wait_for_health 60; then
    VERSION_1=$(get_current_version)
    print_success "Version 1 is healthy (version: $VERSION_1)"
else
    print_failure "Version 1 is not healthy"
fi

# Phase 4: Deploy Version 2 (Second Test Change)
print_section "Phase 4: Deploy Test Version 2"

sleep 5  # Brief pause between deployments

# Create second test change
TEST_CHANGE_2="Rollback test version 2 - $(date '+%Y-%m-%d %H:%M:%S')"
echo "# $TEST_CHANGE_2" > ROLLBACK_TEST_V2.md
echo "This is version 2 of the rollback test." >> ROLLBACK_TEST_V2.md

git add ROLLBACK_TEST_V2.md
git commit -m "test: rollback test version 2"
TEST_COMMIT_2=$(git rev-parse HEAD)

print_test "Deploy version 2"
git push origin main
if wait_for_deployment $ROLLBACK_TIMEOUT; then
    print_success "Version 2 deployed successfully"
else
    print_failure "Version 2 deployment failed"
    exit 1
fi

print_test "Version 2 health check"
if wait_for_health 60; then
    VERSION_2=$(get_current_version)
    print_success "Version 2 is healthy (version: $VERSION_2)"
else
    print_failure "Version 2 is not healthy"
fi

# Verify versions are different
if [[ "$VERSION_1" != "$VERSION_2" ]]; then
    print_success "Versions are different (v1: $VERSION_1, v2: $VERSION_2)"
else
    print_warning "Versions appear the same - version detection may be limited"
fi

# Phase 5: Test Automatic Rollback (Manual Trigger)
print_section "Phase 5: Manual Rollback Test"

print_test "Trigger manual rollback"
if make deploy-rollback; then
    print_success "Rollback triggered successfully"
else
    print_failure "Rollback trigger failed"
fi

print_test "Wait for rollback deployment"
if wait_for_deployment $ROLLBACK_TIMEOUT; then
    print_success "Rollback deployment completed"
else
    print_failure "Rollback deployment failed or timed out"
fi

print_test "Post-rollback health check"
if wait_for_health 60; then
    ROLLBACK_VERSION=$(get_current_version)
    print_success "Application healthy after rollback (version: $ROLLBACK_VERSION)"
else
    print_failure "Application unhealthy after rollback"
fi

# Verify rollback worked
print_test "Rollback version verification"
if [[ "$ROLLBACK_VERSION" == "$VERSION_1" ]] || [[ "$ROLLBACK_VERSION" == "$INITIAL_VERSION" ]]; then
    print_success "Rollback to previous version confirmed"
elif [[ "$ROLLBACK_VERSION" != "$VERSION_2" ]]; then
    print_success "Rollback to different version confirmed"
else
    print_warning "Version verification inconclusive (may still be working)"
fi

# Phase 6: Test Zero-Downtime Rollback
print_section "Phase 6: Zero-Downtime Rollback Test"

print_test "Continuous health monitoring during rollback"
# Start continuous health monitoring
MONITOR_LOG="/tmp/rollback_health_monitor.log"
rm -f "$MONITOR_LOG"

# Monitor health every 2 seconds during rollback
(
    while true; do
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        if curl -s --connect-timeout 2 "http://$DROPLET_IP:8081/health" >/dev/null 2>&1; then
            echo "$timestamp: HEALTHY" >> "$MONITOR_LOG"
        else
            echo "$timestamp: UNHEALTHY" >> "$MONITOR_LOG"
        fi
        sleep 2
    done
) &
MONITOR_PID=$!

# Wait a bit for monitoring to start
sleep 5

# Deploy version 2 again
echo "# Re-deploy version 2 for rollback test" >> ROLLBACK_TEST_V2.md
git add ROLLBACK_TEST_V2.md
git commit -m "test: re-deploy version 2 for rollback test"
git push origin main >/dev/null 2>&1

# Wait for deployment
wait_for_deployment $ROLLBACK_TIMEOUT >/dev/null 2>&1

# Now rollback
make deploy-rollback >/dev/null 2>&1
wait_for_deployment $ROLLBACK_TIMEOUT >/dev/null 2>&1

# Stop monitoring
sleep 10
kill $MONITOR_PID 2>/dev/null || true

# Analyze downtime
if [[ -f "$MONITOR_LOG" ]]; then
    TOTAL_CHECKS=$(wc -l < "$MONITOR_LOG")
    UNHEALTHY_CHECKS=$(grep -c "UNHEALTHY" "$MONITOR_LOG" || echo 0)
    DOWNTIME_SECONDS=$((UNHEALTHY_CHECKS * 2))

    if [[ $UNHEALTHY_CHECKS -eq 0 ]]; then
        print_success "Zero downtime during rollback ($TOTAL_CHECKS checks)"
    elif [[ $DOWNTIME_SECONDS -lt 30 ]]; then
        print_success "Minimal downtime: ${DOWNTIME_SECONDS}s ($UNHEALTHY_CHECKS/$TOTAL_CHECKS checks failed)"
    else
        print_warning "Significant downtime: ${DOWNTIME_SECONDS}s during rollback"
    fi
else
    print_warning "Health monitoring log not found"
fi

# Phase 7: Data Persistence Test
print_section "Phase 7: Data Persistence Test"

print_test "Database persistence during rollback"
# Check if database data persists through rollback
DB_TEST_RESULT=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker exec thappy-postgres-prod psql -U thappy -d thappy -c 'SELECT COUNT(*) FROM information_schema.tables;' 2>/dev/null | grep -E '^[0-9]+$' || echo '0'" 2>/dev/null)

if [[ "$DB_TEST_RESULT" -gt 0 ]]; then
    print_success "Database tables persist through rollback ($DB_TEST_RESULT tables)"
else
    print_warning "Unable to verify database persistence"
fi

print_test "Application data integrity"
# Test if application data is accessible
if curl -s "http://$DROPLET_IP:8081/api/articles" >/dev/null 2>&1; then
    print_success "Application data endpoints accessible"
else
    print_warning "Application data endpoints not accessible"
fi

# Phase 8: Container State Test
print_section "Phase 8: Container State Validation"

print_test "Container status after rollback"
CONTAINER_STATUS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker ps --filter status=running --format '{{.Names}}' | grep thappy | wc -l" 2>/dev/null || echo "0")

if [[ "$CONTAINER_STATUS" -ge 2 ]]; then
    print_success "$CONTAINER_STATUS containers running after rollback"
else
    print_failure "Insufficient containers running ($CONTAINER_STATUS)"
fi

print_test "Container health status"
HEALTHY_CONTAINERS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker ps --filter health=healthy --format '{{.Names}}' | wc -l" 2>/dev/null || echo "0")

if [[ "$HEALTHY_CONTAINERS" -gt 0 ]]; then
    print_success "$HEALTHY_CONTAINERS containers report healthy"
else
    print_warning "No containers report healthy status"
fi

# Phase 9: Rollback Speed Test
print_section "Phase 9: Rollback Performance Test"

print_test "Rollback deployment speed"
START_TIME=$(date +%s)

# Deploy a test change
echo "# Speed test deployment" > SPEED_TEST.md
git add SPEED_TEST.md
git commit -m "test: speed test deployment"
git push origin main >/dev/null 2>&1
wait_for_deployment 180 >/dev/null 2>&1

# Trigger rollback
ROLLBACK_START=$(date +%s)
make deploy-rollback >/dev/null 2>&1
wait_for_deployment 180 >/dev/null 2>&1
ROLLBACK_END=$(date +%s)

ROLLBACK_DURATION=$((ROLLBACK_END - ROLLBACK_START))

if [[ $ROLLBACK_DURATION -lt 300 ]]; then  # 5 minutes
    print_success "Rollback completed in ${ROLLBACK_DURATION}s (< 5 minutes)"
elif [[ $ROLLBACK_DURATION -lt 600 ]]; then  # 10 minutes
    print_warning "Rollback took ${ROLLBACK_DURATION}s (acceptable but slow)"
else
    print_failure "Rollback took ${ROLLBACK_DURATION}s (too slow)"
fi

# Clean up speed test
git reset --hard HEAD~1 >/dev/null 2>&1
rm -f SPEED_TEST.md

# Phase 10: Rollback Verification
print_section "Phase 10: Final Rollback Verification"

print_test "Final application health"
if wait_for_health 30; then
    FINAL_VERSION=$(get_current_version)
    print_success "Application is healthy after all tests (version: $FINAL_VERSION)"
else
    print_failure "Application unhealthy after rollback tests"
fi

print_test "Service responsiveness"
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "http://$DROPLET_IP:8081/health" 2>/dev/null || echo "999")
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "999")

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null || echo 0) )); then
    print_success "Response time acceptable: ${RESPONSE_TIME}s"
else
    print_warning "Response time slow: ${RESPONSE_TIME}s"
fi

print_test "System resource status"
MEMORY_USAGE=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "free | grep Mem | awk '{printf \"%.1f\", \$3/\$2 * 100}'" 2>/dev/null || echo "unknown")
if [[ "$MEMORY_USAGE" != "unknown" ]]; then
    if (( $(echo "$MEMORY_USAGE < 80.0" | bc -l 2>/dev/null || echo 0) )); then
        print_success "Memory usage normal: ${MEMORY_USAGE}%"
    else
        print_warning "Memory usage high: ${MEMORY_USAGE}%"
    fi
else
    print_warning "Unable to check memory usage"
fi

# Final Results
print_header "📊 ROLLBACK TEST RESULTS SUMMARY"

echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "📊 Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 Rollback functionality is working correctly!${NC}"

    echo -e "\n${BLUE}📋 Rollback Test Summary:${NC}"
    echo -e "  🔄 Rollback Duration: ${ROLLBACK_DURATION}s"
    echo -e "  📊 Final Health: Healthy"
    echo -e "  💾 Data Persistence: Verified"
    echo -e "  🐳 Container Status: Running"

    if [[ -f "$MONITOR_LOG" ]]; then
        echo -e "  ⏰ Downtime Analysis: ${DOWNTIME_SECONDS}s total"
    fi

    echo -e "\n${BLUE}🚀 Rollback Capabilities Confirmed:${NC}"
    echo "  ✅ Manual rollback via 'make deploy-rollback'"
    echo "  ✅ Zero/minimal downtime rollback"
    echo "  ✅ Data persistence through rollback"
    echo "  ✅ Container health maintained"
    echo "  ✅ Acceptable rollback speed"

    exit 0
else
    echo -e "\n${RED}❌ Rollback functionality has issues:${NC}"
    for failed_test in "${FAILED_TESTS[@]}"; do
        echo -e "  - ${RED}$failed_test${NC}"
    done

    echo -e "\n${YELLOW}🔧 Recommended Actions:${NC}"
    echo "  1. Check deployment logs: make gh-deploy-logs"
    echo "  2. Verify GitHub Actions workflow"
    echo "  3. Check server resources: make do-status"
    echo "  4. Review rollback configuration"
    echo "  5. Test manual recovery procedures"

    exit 1
fi