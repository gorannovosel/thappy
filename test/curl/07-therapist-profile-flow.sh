#!/bin/bash

# Test script for therapist profile management

BASE_URL="${BASE_URL:-http://localhost:8080}"
echo "Testing therapist profile management at ${BASE_URL}"

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
echo "Therapist Profile Management Tests"
echo "========================================="

# Step 1: Register and login as a therapist
echo ""
print_info "Step 1: Register and login as therapist"

# Register therapist
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.johnson@example.com",
    "password": "SecurePass123!",
    "role": "therapist"
  }')

http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "201" ]; then
    print_success "Therapist registered successfully"
else
    print_info "Therapist may already exist, continuing..."
fi

# Login to get token
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.johnson@example.com",
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

# Step 2: Create therapist profile
echo ""
print_info "Step 2: Create therapist profile"

response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/therapist/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "first_name": "Dr. Robert",
    "last_name": "Johnson",
    "license_number": "PSY-2024-0001",
    "phone": "+1-555-0300",
    "bio": "Experienced therapist specializing in cognitive behavioral therapy."
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    print_success "Therapist profile created successfully"
    echo "Response: $body"
else
    print_info "Profile may already exist (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 3: Get therapist profile
echo ""
print_info "Step 3: Get therapist profile"

response=$(curl -s -w "\n%{http_code}" -X GET ${BASE_URL}/api/therapist/profile/get \
  -H "Authorization: Bearer $TOKEN")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Therapist profile retrieved successfully"
    echo "Response: $body"
else
    print_error "Failed to get profile (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 4: Update bio
echo ""
print_info "Step 4: Update bio"

response=$(curl -s -w "\n%{http_code}" -X PUT ${BASE_URL}/api/therapist/profile/bio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "bio": "Experienced therapist with 10+ years specializing in CBT, anxiety, and depression treatment."
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Bio updated successfully"
    echo "Response: $body"
else
    print_error "Failed to update bio (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 5: Add specializations
echo ""
print_info "Step 5: Add specializations"

# Add first specialization
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/therapist/profile/specialization/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "specialization": "Anxiety Disorders"
  }')

http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "200" ]; then
    print_success "Added specialization: Anxiety Disorders"
else
    print_info "Specialization may already exist"
fi

# Add second specialization
response=$(curl -s -w "\n%{http_code}" -X POST ${BASE_URL}/api/therapist/profile/specialization/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "specialization": "Depression"
  }')

http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "200" ]; then
    print_success "Added specialization: Depression"
else
    print_info "Specialization may already exist"
fi

# Step 6: Update accepting clients status
echo ""
print_info "Step 6: Set accepting clients status"

response=$(curl -s -w "\n%{http_code}" -X PUT ${BASE_URL}/api/therapist/profile/accepting-clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "accepting_clients": true
  }')

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Accepting clients status updated"
    echo "Response: $body"
else
    print_error "Failed to update accepting clients status (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 7: Try to access client endpoint (should fail)
echo ""
print_info "Step 7: Try to access client endpoint (should fail)"

response=$(curl -s -w "\n%{http_code}" -X GET ${BASE_URL}/api/client/profile/get \
  -H "Authorization: Bearer $TOKEN")

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "403" ]; then
    print_success "Correctly denied access to client endpoint (HTTP $http_code)"
    echo "Response: $body"
else
    print_error "Should have been denied access (HTTP $http_code)"
    echo "Response: $body"
fi

# Step 8: Test public endpoint - get accepting therapists
echo ""
print_info "Step 8: Get accepting therapists (public endpoint)"

response=$(curl -s -w "\n%{http_code}" -X GET ${BASE_URL}/api/therapists/accepting)

http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    print_success "Retrieved accepting therapists list"
    echo "Response: $body"
else
    print_error "Failed to get accepting therapists (HTTP $http_code)"
    echo "Response: $body"
fi

echo ""
echo "========================================="
echo "Therapist Profile Management Tests Complete"
echo "========================================="