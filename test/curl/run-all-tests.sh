#!/bin/bash

# Master test script - runs all curl tests in sequence
# This script executes all API tests and provides a summary

echo "==================================================================================="
echo "                        THAPPY API COMPREHENSIVE TEST SUITE"
echo "==================================================================================="
echo "Testing API at: http://localhost:8080"
echo "Started at: $(date)"
echo "==================================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test script
run_test_script() {
    local script_path=$1
    local script_name=$2
    
    echo -e "${BLUE}===================================================================================${NC}"
    echo -e "${BLUE}RUNNING: $script_name${NC}"
    echo -e "${BLUE}===================================================================================${NC}"
    echo ""
    
    if [ -f "$script_path" ]; then
        chmod +x "$script_path"
        bash "$script_path"
        echo ""
    else
        echo -e "${RED}Error: Script not found: $script_path${NC}"
        echo ""
    fi
}

# Check if API is running
echo -e "${YELLOW}Checking API availability...${NC}"
health_response=$(curl -s -w "HTTPSTATUS:%{http_code}" http://localhost:8080/health 2>/dev/null)
health_code=$(echo $health_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$health_code" != "200" ]; then
    echo -e "${RED}Error: API is not responding. Please ensure the API is running on http://localhost:8080${NC}"
    echo "Try running: make dev"
    exit 1
fi

echo -e "${GREEN}✓ API is healthy and responding${NC}"
echo ""

# Clean up any previous test artifacts
rm -f test/curl/tokens.txt

# Run all test scripts in order
run_test_script "test/curl/01-register-users.sh" "01 - USER REGISTRATION TESTS"
run_test_script "test/curl/02-login-users.sh" "02 - USER LOGIN TESTS"
run_test_script "test/curl/03-protected-endpoints.sh" "03 - PROTECTED ENDPOINTS TESTS"
run_test_script "test/curl/04-error-scenarios.sh" "04 - ERROR SCENARIOS TESTS"

# Summary
echo -e "${BLUE}===================================================================================${NC}"
echo -e "${BLUE}                                   TEST SUMMARY${NC}"
echo -e "${BLUE}===================================================================================${NC}"
echo ""
echo "Completed at: $(date)"
echo ""

# Check if any tokens were saved (indicates successful registrations/logins)
if [ -f "test/curl/tokens.txt" ]; then
    token_count=$(wc -l < test/curl/tokens.txt)
    echo -e "${GREEN}✓ Authentication Flow: $token_count users successfully registered and logged in${NC}"
    echo ""
    echo "Valid user accounts created:"
    while IFS=: read -r email token; do
        echo "  - $email (token: ${token:0:20}...)"
    done < test/curl/tokens.txt
    echo ""
else
    echo -e "${RED}✗ Authentication Flow: No successful logins detected${NC}"
    echo ""
fi

# Additional verification - check database state
echo "Database verification:"
echo -e "${YELLOW}Checking user count in database...${NC}"
user_count=$(docker-compose exec -T postgres psql -U thappy -d thappy -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n')
if [ ! -z "$user_count" ] && [ "$user_count" -gt 0 ]; then
    echo -e "${GREEN}✓ Database contains $user_count users${NC}"
else
    echo -e "${RED}✗ Database verification failed or no users found${NC}"
fi
echo ""

# Test specific endpoints to verify they're working
echo "Final API verification:"
echo -e "${YELLOW}Testing core endpoints...${NC}"

# Test health endpoint
health_check=$(curl -s http://localhost:8080/health 2>/dev/null | jq -r '.status' 2>/dev/null)
if [ "$health_check" = "healthy" ]; then
    echo -e "${GREEN}✓ Health endpoint: Working${NC}"
else
    echo -e "${RED}✗ Health endpoint: Failed${NC}"
fi

# Test registration endpoint (should return 400 for empty body)
reg_test=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' http://localhost:8080/api/register -o /dev/null 2>/dev/null)
if [ "$reg_test" = "400" ]; then
    echo -e "${GREEN}✓ Registration endpoint: Working (validates input)${NC}"
else
    echo -e "${RED}✗ Registration endpoint: Unexpected response ($reg_test)${NC}"
fi

# Test login endpoint (should return 400 for empty body)
login_test=$(curl -s -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' http://localhost:8080/api/login -o /dev/null 2>/dev/null)
if [ "$login_test" = "400" ]; then
    echo -e "${GREEN}✓ Login endpoint: Working (validates input)${NC}"
else
    echo -e "${RED}✗ Login endpoint: Unexpected response ($login_test)${NC}"
fi

echo ""
echo -e "${BLUE}===================================================================================${NC}"
echo -e "${GREEN}All tests completed! Check the output above for detailed results.${NC}"
echo ""
echo "To run individual test suites:"
echo "  ./test/curl/01-register-users.sh    # User registration tests"
echo "  ./test/curl/02-login-users.sh       # User login tests"
echo "  ./test/curl/03-protected-endpoints.sh # Protected endpoint tests"
echo "  ./test/curl/04-error-scenarios.sh   # Error handling tests"
echo ""
echo "Saved artifacts:"
if [ -f "test/curl/tokens.txt" ]; then
    echo "  - test/curl/tokens.txt (authentication tokens for further testing)"
fi
echo -e "${BLUE}===================================================================================${NC}"