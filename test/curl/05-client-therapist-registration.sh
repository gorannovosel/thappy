#!/bin/bash

# Test script for client and therapist role-based registration

BASE_URL="${BASE_URL:-http://localhost:8080}"
echo "Testing role-based registration at ${BASE_URL}"

# Function to print colored output
print_success() {
    echo -e "\033[32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[31m✗ $1\033[0m"
}

print_info() {
    echo -e "\033[34mℹ $1\033[0m"
}

echo ""
echo "========================================="
echo "Role-Based Registration Tests"
echo "========================================="

# Test 1: Register a client
echo ""
print_info "Test 1: Register client with role"
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.client@example.com",
    "password": "SecurePass123!",
    "role": "client"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    print_success "Client registration successful (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Client registration failed (HTTP $http_code)"
    echo "Response: $body"
fi

# Test 2: Register a therapist
echo ""
print_info "Test 2: Register therapist with role"
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.smith@example.com",
    "password": "SecurePass123!",
    "role": "therapist"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    print_success "Therapist registration successful (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Therapist registration failed (HTTP $http_code)"
    echo "Response: $body"
fi

# Test 3: Try to register with invalid role
echo ""
print_info "Test 3: Register with invalid role (should fail)"
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "SecurePass123!",
    "role": "admin"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "400" ]; then
    print_success "Invalid role correctly rejected (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Invalid role not rejected properly (HTTP $http_code)"
    echo "Response: $body"
fi

# Test 4: Register without role (use default endpoint)
echo ""
print_info "Test 4: Register without role (default behavior)"
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "default.user@example.com",
    "password": "SecurePass123!"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    print_success "Default registration successful (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Default registration failed (HTTP $http_code)"
    echo "Response: $body"
fi

echo ""
echo "========================================="
echo "Role-Based Registration Tests Complete"
echo "========================================="