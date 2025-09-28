#!/bin/bash

# Test script for sample user authentication
# Verifies that sample users can login and receive JWT tokens

set -e

API_BASE="http://localhost:8081"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Sample User Authentication"
echo "=================================="
echo ""

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local user_type=$3
    local name=$4

    echo -n "Testing login for $name ($user_type): "

    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_BASE/api/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}")

    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')

    if [ "$http_code" -eq 200 ]; then
        token=$(echo $body | grep -o '"token":"[^"]*"' | sed 's/"token":"//g' | sed 's/"//g')
        if [ -n "$token" ]; then
            echo -e "${GREEN}✅ SUCCESS${NC}"

            # Test protected endpoint with token
            profile_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$API_BASE/api/profile" \
                -H "Authorization: Bearer $token")

            profile_http_code=$(echo $profile_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

            if [ "$profile_http_code" -eq 200 ]; then
                echo "  🔐 Protected endpoint access: ${GREEN}✅ SUCCESS${NC}"
            else
                echo "  🔐 Protected endpoint access: ${RED}❌ FAILED (HTTP $profile_http_code)${NC}"
            fi
        else
            echo -e "${RED}❌ FAILED (No token received)${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Test client users
echo "👤 Testing Client Users:"
echo "------------------------"
test_login "alice.client@example.com" "TestPass123!" "client" "Alice Johnson"
test_login "bob.client@example.com" "TestPass123!" "client" "Bob Williams"
test_login "carol.client@example.com" "TestPass123!" "client" "Carol Davis"
test_login "eve.client@example.com" "TestPass123!" "client" "Eve Garcia"
test_login "frank.client@example.com" "TestPass123!" "client" "Frank Rodriguez"
test_login "grace.client@example.com" "TestPass123!" "client" "Grace Lee"
test_login "henry.client@example.com" "TestPass123!" "client" "Henry Taylor"

echo ""
echo "👨‍⚕️ Testing Therapist Users:"
echo "----------------------------"
test_login "dr.smith@example.com" "TestPass123!" "therapist" "Dr. Emily Smith"
test_login "dr.johnson@example.com" "TestPass123!" "therapist" "Dr. Michael Johnson"
test_login "dr.wilson@example.com" "TestPass123!" "therapist" "Dr. Sarah Wilson"
test_login "dr.brown@example.com" "TestPass123!" "therapist" "Dr. David Brown"
test_login "dr.davis@example.com" "TestPass123!" "therapist" "Dr. Lisa Davis"
test_login "dr.martinez@example.com" "TestPass123!" "therapist" "Dr. Carlos Martinez"
test_login "dr.thompson@example.com" "TestPass123!" "therapist" "Dr. Jennifer Thompson"
test_login "dr.anderson@example.com" "TestPass123!" "therapist" "Dr. Robert Anderson"

echo ""
echo "🔒 Testing Invalid Credentials:"
echo "-------------------------------"
echo -n "Testing wrong password: "
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_BASE/api/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "alice.client@example.com", "password": "WrongPassword"}')

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$http_code" -eq 401 ]; then
    echo -e "${GREEN}✅ CORRECTLY REJECTED${NC}"
else
    echo -e "${RED}❌ FAILED (Expected 401, got $http_code)${NC}"
fi

echo ""
echo "🔒 Testing Inactive User:"
echo "------------------------"
echo -n "Testing inactive user (david.client@example.com): "
response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_BASE/api/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "david.client@example.com", "password": "TestPass123!"}')

http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$http_code" -eq 401 ] || [ "$http_code" -eq 403 ]; then
    echo -e "${GREEN}✅ CORRECTLY REJECTED${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING (Expected 401/403, got $http_code)${NC}"
    echo "  Note: Inactive user handling may need review"
fi

echo ""
echo "✅ Sample user authentication test completed!"
echo ""
echo "📋 Summary:"
echo "- All sample users should login successfully with password 'TestPass123!'"
echo "- Invalid credentials should be rejected (HTTP 401)"
echo "- Inactive users should be rejected or handled appropriately"
echo "- JWT tokens should work for protected endpoints"