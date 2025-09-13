# API Routes Documentation

This document provides complete API route specifications for frontend implementation.

## Base URL
```
http://localhost:8080
```

## Authentication
Most endpoints require JWT token authentication via `Authorization: Bearer <token>` header.

---

## Public Endpoints

### Health Check
```http
GET /health
```
**Description**: Check API health status
**Authentication**: None required
**Response**:
```json
{
  "status": "healthy",
  "service": "thappy-api"
}
```

---

## User Authentication

### Register User (Default Role: Client)
```http
POST /api/register
Content-Type: application/json
```
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response (201)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client",
    "is_active": true,
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  },
  "message": "User registered successfully"
}
```

### Register User with Specific Role
```http
POST /api/register-with-role
Content-Type: application/json
```
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "client|therapist"
}
```
**Response (201)**: Same as above with specified role

### Login
```http
POST /api/login
Content-Type: application/json
```
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client",
    "is_active": true,
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  },
  "message": "Login successful"
}
```

---

## General User Profile

### Get User Profile
```http
GET /api/profile
Authorization: Bearer <token>
```
**Response (200)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client",
    "is_active": true,
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  }
}
```

### Update User Profile
```http
PUT /api/profile/update
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "email": "newemail@example.com"
}
```
**Response (200)**: Updated user object

---

## Client Profile Management
**Note**: All client endpoints require `client` role

### Create Client Profile
```http
POST /api/client/profile
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0100",
  "emergency_contact": "+1-555-0101"
}
```
**Response (201)**:
```json
{
  "profile": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0100",
    "emergency_contact": "+1-555-0101",
    "date_of_birth": null,
    "therapist_id": null,
    "notes": "",
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  },
  "message": "Client profile created successfully"
}
```

### Get Client Profile
```http
GET /api/client/profile/get
Authorization: Bearer <token>
```
**Response (200)**:
```json
{
  "profile": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0100",
    "emergency_contact": "+1-555-0101",
    "date_of_birth": "1990-01-15T00:00:00Z",
    "therapist_id": "therapist-uuid",
    "notes": "Client notes here",
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  }
}
```

### Update Personal Information
```http
PUT /api/client/profile/personal-info
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```
**Response (200)**: Updated profile with message

### Update Contact Information
```http
PUT /api/client/profile/contact-info
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "phone": "+1-555-0200",
  "emergency_contact": "+1-555-0201"
}
```
**Response (200)**: Updated profile with message

### Set Date of Birth
```http
PUT /api/client/profile/date-of-birth
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "date_of_birth": "1990-01-15"
}
```
**Response (200)**: Updated profile with message

### Delete Client Profile
```http
DELETE /api/client/profile/delete
Authorization: Bearer <token>
```
**Response (200)**:
```json
{
  "message": "Client profile deleted successfully"
}
```

---

## Therapist Profile Management
**Note**: All therapist endpoints require `therapist` role

### Create Therapist Profile
```http
POST /api/therapist/profile
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "first_name": "Dr. Sarah",
  "last_name": "Johnson",
  "license_number": "PSY-2024-0001",
  "phone": "+1-555-0300",
  "bio": "Licensed clinical psychologist with 10+ years experience."
}
```
**Response (201)**:
```json
{
  "profile": {
    "user_id": "uuid",
    "first_name": "Dr. Sarah",
    "last_name": "Johnson",
    "license_number": "PSY-2024-0001",
    "phone": "+1-555-0300",
    "bio": "Licensed clinical psychologist with 10+ years experience.",
    "specializations": [],
    "accepting_clients": true,
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  },
  "message": "Therapist profile created successfully"
}
```

### Get Therapist Profile
```http
GET /api/therapist/profile/get
Authorization: Bearer <token>
```
**Response (200)**:
```json
{
  "profile": {
    "user_id": "uuid",
    "first_name": "Dr. Sarah",
    "last_name": "Johnson",
    "license_number": "PSY-2024-0001",
    "phone": "+1-555-0300",
    "bio": "Licensed clinical psychologist...",
    "specializations": ["Anxiety Disorders", "Depression", "PTSD"],
    "accepting_clients": true,
    "created_at": "2025-09-13T12:00:00Z",
    "updated_at": "2025-09-13T12:00:00Z"
  }
}
```

### Update Personal Information
```http
PUT /api/therapist/profile/personal-info
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "first_name": "Dr. Sarah",
  "last_name": "Wilson"
}
```
**Response (200)**: Updated profile with message

### Update Contact Information
```http
PUT /api/therapist/profile/contact-info
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "phone": "+1-555-0400"
}
```
**Response (200)**: Updated profile with message

### Update Bio
```http
PUT /api/therapist/profile/bio
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "bio": "Updated bio text describing experience and approach..."
}
```
**Response (200)**: Updated profile with message

### Update License Number
```http
PUT /api/therapist/profile/license
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "license_number": "PSY-2024-0002"
}
```
**Response (200)**: Updated profile with message

### Update All Specializations
```http
PUT /api/therapist/profile/specializations
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "specializations": ["Anxiety Disorders", "Depression", "PTSD", "Family Therapy"]
}
```
**Response (200)**: Updated profile with message

### Add Single Specialization
```http
POST /api/therapist/profile/specialization/add
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "specialization": "Trauma Therapy"
}
```
**Response (200)**: Updated profile with message

### Remove Single Specialization
```http
DELETE /api/therapist/profile/specialization/remove
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "specialization": "PTSD"
}
```
**Response (200)**: Updated profile with message

### Set Accepting Clients Status
```http
PUT /api/therapist/profile/accepting-clients
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "accepting_clients": false
}
```
**Response (200)**: Updated profile with message

### Delete Therapist Profile
```http
DELETE /api/therapist/profile/delete
Authorization: Bearer <token>
```
**Response (200)**:
```json
{
  "message": "Therapist profile deleted successfully"
}
```

---

## Public Therapist Discovery

### Get Accepting Therapists
```http
GET /api/therapists/accepting
```
**Authentication**: None required
**Description**: Get list of all therapists currently accepting clients
**Response (200)**:
```json
{
  "therapists": [
    {
      "user_id": "uuid",
      "first_name": "Dr. Sarah",
      "last_name": "Johnson",
      "license_number": "PSY-2024-0001",
      "phone": "+1-555-0300",
      "bio": "Licensed clinical psychologist...",
      "specializations": ["Anxiety Disorders", "Depression"],
      "accepting_clients": true,
      "created_at": "2025-09-13T12:00:00Z",
      "updated_at": "2025-09-13T12:00:00Z"
    }
  ],
  "message": "Available therapists retrieved successfully"
}
```

---

## Error Responses

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data/validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient privileges (wrong role) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "error": "Description of what went wrong"
}
```

### Common Error Messages

#### Authentication Errors
- `"Authorization header required"` - No Bearer token provided
- `"Invalid token"` - Token is malformed or expired
- `"Insufficient privileges"` - User doesn't have required role

#### Validation Errors
- `"email is required"` - Missing email field
- `"password is required"` - Missing password field
- `"first_name is required"` - Missing first name
- `"invalid role - must be 'client' or 'therapist'"` - Invalid role value

#### Business Logic Errors
- `"User with this email already exists"` - Duplicate registration
- `"Client profile already exists"` - Duplicate profile creation
- `"Therapist profile not found"` - Profile doesn't exist
- `"License number already in use"` - Duplicate license

---

## Frontend Implementation Guidelines

### Authentication Flow
1. **Registration**: Use `/api/register-with-role` to specify user type
2. **Login**: Store returned JWT token securely
3. **Token Management**: Include token in all protected requests
4. **Role-based UI**: Show different interfaces based on user.role

### Profile Management Flow
1. **After Login**: Check if user has profile with GET requests
2. **Profile Creation**: Guide users through profile setup
3. **Profile Updates**: Use specific endpoints for different data types
4. **Error Handling**: Provide clear feedback for validation errors

### State Management Recommendations
```javascript
// User state structure
{
  user: {
    id: "uuid",
    email: "user@example.com",
    role: "client|therapist",
    is_active: boolean,
    token: "jwt-token"
  },
  profile: {
    // Client or Therapist profile data
  }
}
```

### Role-Based Routing
```javascript
// Route protection based on user role
const routes = {
  '/client/*': 'client', // Requires client role
  '/therapist/*': 'therapist', // Requires therapist role
  '/public/*': null // No authentication required
}
```

This API provides complete CRUD operations for both user types with proper role-based access control and comprehensive error handling.