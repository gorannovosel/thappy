#!/bin/bash

# Test script for protected endpoints
# This script tests authenticated endpoints using tokens from login

echo "=== Protected Endpoints Tests ==="
echo "Testing API at http://localhost:8080"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# File with saved tokens
TOKEN_FILE="test/curl/tokens.txt"

# Function to test protected endpoint
test_protected_endpoint() {
    local endpoint=$1
    local method=$2
    local token=$3
    local description=$4
    local data=$5
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "$method $endpoint"
    
    if [ ! -z "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            http://localhost:8080$endpoint)
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X $method \
            -H "Authorization: Bearer $token" \
            http://localhost:8080$endpoint)
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ $http_code -eq 200 ]; then
        echo -e "${GREEN}✓ SUCCESS ($http_code)${NC}"
        echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
    else
        echo -e "${RED}✗ FAILED ($http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# Check if token file exists
if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}Error: Token file not found. Please run 02-login-users.sh first${NC}"
    exit 1
fi

# Read tokens
echo "Reading saved tokens..."
declare -A tokens
while IFS=: read -r email token; do
    tokens["$email"]="$token"
    echo "Loaded token for: $email"
done < "$TOKEN_FILE"
echo ""

# Get Alice's token for testing
alice_token="${tokens['alice@example.com']}"
bob_token="${tokens['bob@example.com']}"

if [ -z "$alice_token" ]; then
    echo -e "${RED}Error: No token found for alice@example.com${NC}"
    exit 1
fi

echo "1. Testing /api/profile endpoint (GET):"
test_protected_endpoint "/api/profile" "GET" "$alice_token" "Alice - Get profile with valid token"
test_protected_endpoint "/api/profile" "GET" "invalid_token" "Invalid token"
test_protected_endpoint "/api/profile" "GET" "" "Missing token"

echo "2. Testing /api/profile/update endpoint (POST):"
update_data='{
    "email": "alice.updated@example.com"
}'
test_protected_endpoint "/api/profile/update" "POST" "$alice_token" "Alice - Update profile with valid token" "$update_data"

invalid_update_data='{
    "email": "invalid-email"
}'
test_protected_endpoint "/api/profile/update" "POST" "$alice_token" "Alice - Update with invalid email" "$invalid_update_data"

if [ ! -z "$bob_token" ]; then
    echo "3. Testing with Bob's token:"
    test_protected_endpoint "/api/profile" "GET" "$bob_token" "Bob - Get profile with valid token"
fi

echo "4. Testing without Authorization header:"
echo -e "${YELLOW}Testing: No Authorization header${NC}"
echo "GET /api/profile"

response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X GET \
    http://localhost:8080/api/profile)

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

if [ $http_code -eq 401 ]; then
    echo -e "${GREEN}✓ SUCCESS ($http_code) - Correctly rejected unauthorized request${NC}"
else
    echo -e "${RED}✗ FAILED ($http_code) - Should have returned 401${NC}"
fi
echo "Response: $body"
echo ""

echo "=== Protected Endpoints Tests Completed ==="