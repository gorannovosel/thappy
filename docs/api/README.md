# API Reference

Complete documentation for the Thappy Authentication API.

## Base URL

```
http://localhost:8080
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "user": { ... },
  "message": "Operation successful",
  "token": "jwt-token-here"  // Only for login
}
```

### Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",      // Optional
  "details": "Additional details"  // Optional
}
```

## Endpoints

### Health Check

#### `GET /health`

Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "thappy",
  "version": "1.0.0"
}
```

**Status Codes:**
- `200` - API is healthy
- `503` - API is unhealthy

---

### User Registration

#### `POST /api/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Minimum 8 characters

**Success Response (201):**
```json
{
  "user": {
    "id": "683493e2-0f42-54ee-789d-325d277c3cbe",
    "email": "user@example.com",
    "created_at": "2025-09-13T08:03:17.092721Z",
    "updated_at": "2025-09-13T08:03:17.092721Z"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**
- `400` - Validation error (invalid email, weak password, missing fields)
- `409` - Email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### User Login

#### `POST /api/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "683493e2-0f42-54ee-789d-325d277c3cbe",
    "email": "user@example.com",
    "created_at": "2025-09-13T08:03:17.092721Z",
    "updated_at": "2025-09-13T08:03:17.092721Z"
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

### Get Profile

#### `GET /api/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "683493e2-0f42-54ee-789d-325d277c3cbe",
    "email": "user@example.com",
    "created_at": "2025-09-13T08:03:17.092721Z",
    "updated_at": "2025-09-13T08:03:17.092721Z"
  }
}
```

**Error Responses:**
- `401` - Missing or invalid token

**Example:**
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

### Update Profile

#### `POST /api/profile/update`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "683493e2-0f42-54ee-789d-325d277c3cbe",
    "email": "newemail@example.com",
    "created_at": "2025-09-13T08:03:17.092721Z",
    "updated_at": "2025-09-13T08:03:18.189307Z"
  }
}
```

**Error Responses:**
- `400` - Invalid email format
- `401` - Missing or invalid token
- `409` - Email already taken

**Example:**
```bash
curl -X POST http://localhost:8080/api/profile/update \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 404 | Not Found | Endpoint not found |
| 405 | Method Not Allowed | HTTP method not supported |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Rate limiting per IP address
- Rate limiting per authenticated user
- Different limits for different endpoints

## Testing

Use the provided test scripts to verify API functionality:

```bash
# Complete test suite
./test/curl/run-all-tests.sh

# Individual test suites
./test/curl/01-register-users.sh     # Registration tests
./test/curl/02-login-users.sh        # Login tests  
./test/curl/03-protected-endpoints.sh # Protected endpoint tests
./test/curl/04-error-scenarios.sh    # Error handling tests
```

## Postman Collection

Import the API into Postman:

1. Create a new collection named "Thappy API"
2. Set base URL variable: `{{base_url}}` = `http://localhost:8080`
3. Set authentication token variable: `{{auth_token}}`
4. Add the endpoints above with the appropriate headers and body

## Additional Resources

- [Database Schema](database.md) - Database structure and relationships
- [Authentication Guide](../guides/authentication.md) - JWT implementation details
- [Testing Guide](../development/testing.md) - Running and writing API tests