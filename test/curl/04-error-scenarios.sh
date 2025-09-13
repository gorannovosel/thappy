#!/bin/bash

# Test script for error scenarios and edge cases
# This script tests various error conditions and edge cases

echo "=== Error Scenarios Tests ==="
echo "Testing API at http://localhost:8080"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test error scenarios
test_error_scenario() {
    local endpoint=$1
    local method=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local headers=$6
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "$method $endpoint"
    
    if [ ! -z "$headers" ]; then
        header_args=""
        IFS='|' read -ra HEADER_ARRAY <<< "$headers"
        for header in "${HEADER_ARRAY[@]}"; do
            header_args="$header_args -H \"$header\""
        done
        
        if [ ! -z "$data" ]; then
            response=$(eval "curl -s -w \"HTTPSTATUS:%{http_code}\" -X $method $header_args -d '$data' http://localhost:8080$endpoint")
        else
            response=$(eval "curl -s -w \"HTTPSTATUS:%{http_code}\" -X $method $header_args http://localhost:8080$endpoint")
        fi
    else
        if [ ! -z "$data" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X $method \
                -d "$data" \
                http://localhost:8080$endpoint)
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                -X $method \
                http://localhost:8080$endpoint)
        fi
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ $http_code -eq $expected_status ]; then
        echo -e "${GREEN}✓ SUCCESS ($http_code) - Expected status received${NC}"
    else
        echo -e "${RED}✗ FAILED ($http_code) - Expected $expected_status${NC}"
    fi
    echo "Response: $body"
    echo ""
}

echo "1. Content-Type validation:"
test_error_scenario "/api/register" "POST" '{"email":"test@test.com","password":"Test123!"}' 400 "Missing Content-Type header" ""
test_error_scenario "/api/register" "POST" '{"email":"test@test.com","password":"Test123!"}' 400 "Wrong Content-Type" "Content-Type: text/plain"

echo "2. Malformed JSON:"
test_error_scenario "/api/register" "POST" '{"email":"test@test.com","password":}' 400 "Invalid JSON syntax" "Content-Type: application/json"
test_error_scenario "/api/login" "POST" '{"email":"test@test.com"' 400 "Incomplete JSON" "Content-Type: application/json"

echo "3. HTTP Method validation:"
test_error_scenario "/api/register" "GET" "" 405 "GET on register endpoint"
test_error_scenario "/api/login" "PUT" "" 405 "PUT on login endpoint"
test_error_scenario "/api/profile" "POST" "" 405 "POST on profile endpoint"

echo "4. Non-existent endpoints:"
test_error_scenario "/api/nonexistent" "GET" "" 404 "Non-existent endpoint"
test_error_scenario "/api/users" "GET" "" 404 "Wrong endpoint path"

echo "5. Authentication header formats:"
test_error_scenario "/api/profile" "GET" "" 401 "Malformed Bearer token" "Authorization: Bearer"
test_error_scenario "/api/profile" "GET" "" 401 "Wrong auth scheme" "Authorization: Basic dGVzdDp0ZXN0"
test_error_scenario "/api/profile" "GET" "" 401 "Invalid token format" "Authorization: Bearer invalid.token.here"

echo "6. Request body validation:"
test_error_scenario "/api/register" "POST" '{}' 400 "Empty registration data" "Content-Type: application/json"
test_error_scenario "/api/login" "POST" '{"email":"test@test.com"}' 400 "Missing password" "Content-Type: application/json"
test_error_scenario "/api/register" "POST" '{"password":"Test123!"}' 400 "Missing email" "Content-Type: application/json"

echo "7. Large request bodies:"
large_data='{"email":"test@example.com","password":"Test123!","extra_field":"'
for i in {1..1000}; do
    large_data="${large_data}a"
done
large_data="${large_data}\"}"

test_error_scenario "/api/register" "POST" "$large_data" 400 "Very large request body" "Content-Type: application/json"

echo "8. Health check (should succeed):"
test_error_scenario "/health" "GET" "" 200 "Health endpoint"

echo "9. Special characters in requests:"
test_error_scenario "/api/register" "POST" '{"email":"test@test.com","password":"üñíçødé123!"}' 400 "Unicode in password" "Content-Type: application/json"
test_error_scenario "/api/register" "POST" '{"email":"tëst@tëst.com","password":"Test123!"}' 400 "Unicode in email" "Content-Type: application/json"

echo "=== Error Scenarios Tests Completed ==="