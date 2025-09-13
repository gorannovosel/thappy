#!/bin/bash

# Test script for user login
# This script tests login functionality with the users registered in script 01

echo "=== User Login Tests ==="
echo "Testing API at http://localhost:8080"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# File to store tokens for later use
TOKEN_FILE="test/curl/tokens.txt"
> $TOKEN_FILE # Clear the file

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local description=$3
    local save_token=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "POST /api/login - Email: $email"
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\"
        }" \
        http://localhost:8080/api/login)
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ $http_code -eq 200 ]; then
        echo -e "${GREEN}✓ SUCCESS ($http_code)${NC}"
        echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
        
        # Save token if requested
        if [ "$save_token" = "true" ]; then
            token=$(echo $body | jq -r '.token' 2>/dev/null || echo "")
            if [ ! -z "$token" ] && [ "$token" != "null" ]; then
                echo "$email:$token" >> $TOKEN_FILE
                echo -e "${GREEN}Token saved for $email${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ FAILED ($http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# Test Cases
echo "1. Valid login attempts (with registered users):"
test_login "alice@example.com" "SecurePass123!" "Alice - Valid login" true
test_login "bob@example.com" "MyPassword456!" "Bob - Valid login" true
test_login "charlie@example.com" "SuperSecret789!" "Charlie - Valid login" true

echo "2. Invalid login attempts:"
test_login "alice@example.com" "WrongPassword!" "Alice - Wrong password"
test_login "nonexistent@example.com" "SomePassword123!" "Non-existent user"
test_login "" "SecurePass123!" "Empty email"
test_login "alice@example.com" "" "Empty password"
test_login "invalid-email" "SecurePass123!" "Invalid email format"

echo "=== Login Tests Completed ==="
echo ""
echo "Saved tokens in: $TOKEN_FILE"
if [ -f "$TOKEN_FILE" ]; then
    echo "Available tokens:"
    cat $TOKEN_FILE
fi