#!/bin/bash

# Test script for user registration
# This script registers multiple test users to verify the registration endpoint

echo "=== User Registration Tests ==="
echo "Testing API at http://localhost:8080"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test registration
test_registration() {
    local email=$1
    local password=$2
    local description=$3
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "POST /api/register - Email: $email"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\"
        }" \
        http://localhost:8080/api/register)
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ $http_code -eq 200 ] || [ $http_code -eq 201 ]; then
        echo -e "${GREEN}✓ SUCCESS ($http_code)${NC}"
        echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
    else
        echo -e "${RED}✗ FAILED ($http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# Test Cases
echo "1. Valid user registrations:"
test_registration "alice@example.com" "SecurePass123!" "Alice - Valid user"
test_registration "bob@example.com" "MyPassword456!" "Bob - Valid user" 
test_registration "charlie@example.com" "SuperSecret789!" "Charlie - Valid user"

echo "2. Invalid registration attempts:"
test_registration "alice@example.com" "DifferentPass123!" "Alice - Duplicate email"
test_registration "invalid-email" "ValidPass123!" "Invalid email format"
test_registration "test@example.com" "short" "Password too short"
test_registration "" "ValidPass123!" "Empty email"
test_registration "empty@example.com" "" "Empty password"

echo "=== Registration Tests Completed ==="