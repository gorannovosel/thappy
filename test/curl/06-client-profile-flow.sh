#!/bin/bash

# Test script for client profile management

BASE_URL="${BASE_URL:-http://localhost:8080}"
echo "Testing client profile management at ${BASE_URL}"

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
echo "Client Profile Management Tests"
echo "========================================="

# Step 1: Register and login as a client
echo ""
print_info "Step 1: Register and login as client"

# Register client
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.client@example.com",
    "password": "SecurePass123!",
    "role": "client"
  }')

http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "201" ]; then
    print_success "Client registered successfully"
else
    print_info "Client may already exist, continuing..."
fi

# Login to get token
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.client@example.com",
    "password": "SecurePass123!"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Login successful"
    TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "Token obtained: ${TOKEN:0:20}..."
else
    print_error "Login failed (HTTP $http_code)"
    echo "Response: $body"
    exit 1
fi

# Step 2: Create client profile
echo ""
print_info "Step 2: Create client profile"

response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/client/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "+1-555-0100",
    "emergency_contact": "+1-555-0101"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    print_success "Client profile created successfully"
    echo "Response: $body"
else
    print_info "Profile may already exist (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 3: Get client profile
echo ""
print_info "Step 3: Get client profile"

response=$(curl -s -w "\n%{http_code}" -X GET ${BASE_URL}/api/client/profile/get \
  -H "Authorization: Bearer $TOKEN")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Client profile retrieved successfully"
    echo "Response: $body"
else
    print_error "Failed to get profile (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 4: Update personal info
echo ""
print_info "Step 4: Update personal information"

response=$(curl -s -w "\n%{http_code}" -X PUT ${BASE_URL}/api/client/profile/personal-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Personal info updated successfully"
    echo "Response: $body"
else
    print_error "Failed to update personal info (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 5: Update contact info
echo ""
print_info "Step 5: Update contact information"

response=$(curl -s -w "\n%{http_code}" -X PUT ${BASE_URL}/api/client/profile/contact-info \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone": "+1-555-0200",
    "emergency_contact": "+1-555-0201"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Contact info updated successfully"
    echo "Response: $body"
else
    print_error "Failed to update contact info (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 6: Set date of birth
echo ""
print_info "Step 6: Set date of birth"

response=$(curl -s -w "\n%{http_code}" -X PUT ${BASE_URL}/api/client/profile/date-of-birth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "date_of_birth": "1990-01-15"
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Date of birth set successfully"
    echo "Response: $body"
else
    print_error "Failed to set date of birth (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 7: Try to access therapist endpoint (should fail)
echo ""
print_info "Step 7: Try to access therapist endpoint (should fail)"

response=$(curl -s -w "\n%{http_code}" -X GET ${BASE_URL}/api/therapist/profile/get \
  -H "Authorization: Bearer $TOKEN")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "403" ]; then
    print_success "Correctly denied access to therapist endpoint (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Should have been denied access (HTTP $http_code)"
    echo "Response: $body"
fi

echo ""
echo "========================================="
echo "Client Profile Management Tests Complete"
echo "========================================="