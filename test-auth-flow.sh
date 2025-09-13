#!/bin/bash
# Test script for authentication flow

BASE_URL="http://localhost:8080"

echo "🧪 Testing Thappy Authentication Flow"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n${YELLOW}1. Testing Health Check${NC}"
health_response=$(curl -s -w "HTTP_CODE:%{http_code}" "$BASE_URL/health")
http_code=$(echo "$health_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$health_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ Health check failed (HTTP $http_code)${NC}"
    echo "$response_body"
fi

# Test 2: Register Client
echo -e "\n${YELLOW}2. Testing Client Registration${NC}"
client_reg_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/register-with-role" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "TestPass123!",
    "role": "client"
  }')

http_code=$(echo "$client_reg_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$client_reg_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✅ Client registration successful${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
    CLIENT_TOKEN=$(echo "$response_body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
else
    echo -e "${RED}❌ Client registration failed (HTTP $http_code)${NC}"
    echo "$response_body"
fi

# Test 3: Register Therapist
echo -e "\n${YELLOW}3. Testing Therapist Registration${NC}"
therapist_reg_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/register-with-role" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist@test.com",
    "password": "TestPass123!",
    "role": "therapist"
  }')

http_code=$(echo "$therapist_reg_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$therapist_reg_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✅ Therapist registration successful${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
    THERAPIST_TOKEN=$(echo "$response_body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
else
    echo -e "${RED}❌ Therapist registration failed (HTTP $http_code)${NC}"
    echo "$response_body"
fi

# Test 4: Login Client
echo -e "\n${YELLOW}4. Testing Client Login${NC}"
client_login_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "TestPass123!"
  }')

http_code=$(echo "$client_login_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$client_login_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ Client login successful${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ Client login failed (HTTP $http_code)${NC}"
    echo "$response_body"
fi

# Test 5: Test Protected Route (Client Profile)
if [ -n "$CLIENT_TOKEN" ]; then
    echo -e "\n${YELLOW}5. Testing Protected Route (Client Profile)${NC}"
    profile_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X GET "$BASE_URL/api/profile" \
      -H "Authorization: Bearer $CLIENT_TOKEN")

    http_code=$(echo "$profile_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
    response_body=$(echo "$profile_response" | sed 's/HTTP_CODE:.*//')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Protected route access successful${NC}"
        echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
    else
        echo -e "${RED}❌ Protected route access failed (HTTP $http_code)${NC}"
        echo "$response_body"
    fi
fi

# Test 6: Test Invalid Credentials
echo -e "\n${YELLOW}6. Testing Invalid Credentials${NC}"
invalid_login_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "WrongPassword!"
  }')

http_code=$(echo "$invalid_login_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$invalid_login_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "401" ]; then
    echo -e "${GREEN}✅ Invalid credentials properly rejected${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ Invalid credentials test failed (expected 401, got $http_code)${NC}"
    echo "$response_body"
fi

# Test 7: Test Duplicate Email Registration
echo -e "\n${YELLOW}7. Testing Duplicate Email Registration${NC}"
duplicate_reg_response=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/register-with-role" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "TestPass123!",
    "role": "client"
  }')

http_code=$(echo "$duplicate_reg_response" | grep -o "HTTP_CODE:.*" | cut -d: -f2)
response_body=$(echo "$duplicate_reg_response" | sed 's/HTTP_CODE:.*//')

if [ "$http_code" = "409" ]; then
    echo -e "${GREEN}✅ Duplicate email properly rejected${NC}"
    echo "$response_body" | python3 -m json.tool 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ Duplicate email test failed (expected 409, got $http_code)${NC}"
    echo "$response_body"
fi

echo -e "\n🎉 Authentication flow tests completed!"
echo ""
echo "📝 Test Summary:"
echo "- Health check"
echo "- Client registration"
echo "- Therapist registration"
echo "- Client login"
echo "- Protected route access"
echo "- Invalid credentials rejection"
echo "- Duplicate email rejection"
echo ""
echo "🌐 Frontend available at: http://localhost:3000"
echo "🚀 Backend API available at: http://localhost:8080"
echo ""
echo "💡 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Try the registration and login flows manually"
echo "3. Check browser DevTools for network requests"
echo "4. Test role-based navigation"