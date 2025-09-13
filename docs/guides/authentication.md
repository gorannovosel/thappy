# Authentication Guide

Complete guide to authentication implementation in the Thappy API.

## Overview

The Thappy API uses JWT (JSON Web Tokens) for stateless authentication with HMAC-SHA256 signing.

## JWT Implementation

### Token Structure

```
Header.Payload.Signature
```

**Example JWT Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjgzNDkzZTItMGY0Mi01NGVlLTc4OWQtMzI1ZDI3N2MzY2JlIiwiaWF0IjoiMjAyNS0wOS0xM1QwODowMzoxNy41MzM0NzI1NjhaIiwiZXhwIjoiMjAyNS0wOS0xNFQwODowMzoxNy41MzM0NzI1NjhaIn0.dTpYW8nHi_mArvdmM1LGUI4Gc1Xw881VT6lmpTQNtwM
```

### Token Components

#### 1. Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 2. Payload (Claims)
```json
{
  "user_id": "683493e2-0f42-54ee-789d-325d277c3cbe",
  "iat": "2025-09-13T08:03:17.533472568Z",
  "exp": "2025-09-14T08:03:17.533472568Z"
}
```

#### 3. Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## Authentication Flow

### 1. User Registration

```bash
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
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

### 2. User Login

```bash
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
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

### 3. Accessing Protected Resources

```bash
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Implementation Details

### Token Service

Located in `internal/service/auth/token.go`:

```go
type JWTTokenService struct {
    secretKey []byte
    ttl       time.Duration
}

func (s *JWTTokenService) GenerateToken(userID string) (string, error) {
    now := time.Now()
    claims := Claims{
        UserID:    userID,
        IssuedAt:  now,
        ExpiresAt: now.Add(s.ttl),
    }

    // Create header and claims
    header := map[string]string{"alg": "HS256", "typ": "JWT"}
    headerJSON, _ := json.Marshal(header)
    claimsJSON, _ := json.Marshal(claims)

    // Base64 URL encode
    encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
    encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)

    // Create signature
    message := encodedHeader + "." + encodedClaims
    h := hmac.New(sha256.New, s.secretKey)
    h.Write([]byte(message))
    signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

    return message + "." + signature, nil
}
```

### Authentication Middleware

Located in `internal/handler/http/middleware.go`:

```go
func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Extract token from Authorization header
        token := m.extractTokenFromHeader(r)
        if token == "" {
            writeErrorResponse(w, http.StatusUnauthorized, "Authorization header required")
            return
        }

        // Validate token
        userID, err := m.tokenService.ValidateToken(token)
        if err != nil {
            m.handleTokenError(w, err)
            return
        }

        // Verify user exists
        _, err = m.userService.GetUserByID(r.Context(), userID)
        if err != nil {
            writeErrorResponse(w, http.StatusUnauthorized, "User not found")
            return
        }

        // Add user ID to context
        ctx := context.WithValue(r.Context(), "userID", userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

## Password Security

### Password Hashing

Uses bcrypt with default cost (currently 10):

```go
func hashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(bytes), nil
}

func (u *User) ValidatePassword(password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
    return err == nil
}
```

### Password Validation Rules

- Minimum 8 characters
- No additional complexity requirements (can be enhanced)

```go
func validatePassword(password string) error {
    if password == "" {
        return errors.New("password is required")
    }
    if len(password) < 8 {
        return errors.New("password must be at least 8 characters")
    }
    return nil
}
```

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=thappy-dev-secret-change-in-production
JWT_TOKEN_TTL=24h
JWT_REFRESH_TTL=168h

# Password Hashing
BCRYPT_COST=12  # Higher = more secure but slower
```

### Production Security Settings

```bash
# Use a strong, random secret (minimum 32 characters)
JWT_SECRET=$(openssl rand -base64 32)

# Shorter token lifetime for better security
JWT_TOKEN_TTL=1h
JWT_REFRESH_TTL=24h

# Higher bcrypt cost for better security
BCRYPT_COST=14
```

## Security Considerations

### JWT Best Practices

1. **Secret Key Security**
   - Use strong, random secrets (minimum 256 bits)
   - Rotate secrets regularly
   - Store secrets securely (environment variables, secret managers)

2. **Token Lifetime**
   - Keep access tokens short-lived (1-24 hours)
   - Implement refresh tokens for longer sessions
   - Consider user activity for token expiration

3. **Token Storage**
   - Never store tokens in localStorage (XSS vulnerable)
   - Use httpOnly cookies for web applications
   - Clear tokens on logout

### Current Limitations

1. **No Token Revocation**
   - Tokens remain valid until expiration
   - Consider implementing a blacklist for critical applications

2. **No Refresh Tokens**
   - Users must re-login when tokens expire
   - Consider implementing refresh token flow

3. **No Rate Limiting**
   - No protection against brute force attacks
   - Consider implementing login attempt limits

## Client Integration

### JavaScript/Browser

```javascript
// Login
async function login(email, password) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.token) {
        // Store token securely
        localStorage.setItem('auth_token', data.token);
    }
    return data;
}

// Authenticated request
async function getProfile() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}
```

### cURL Examples

```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}' \
  | jq -r '.token')

# Use token for authenticated request
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Python Example

```python
import requests
import json

class ThappyClient:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f"{self.base_url}/api/login", 
            json={"email": email, "password": password})
        
        if response.status_code == 200:
            data = response.json()
            self.token = data['token']
            return data
        else:
            raise Exception(f"Login failed: {response.text}")
    
    def get_profile(self):
        if not self.token:
            raise Exception("Not authenticated")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.base_url}/api/profile", headers=headers)
        return response.json()

# Usage
client = ThappyClient()
client.login("user@example.com", "SecurePassword123!")
profile = client.get_profile()
```

## Testing Authentication

### Test Scripts

The project includes comprehensive authentication tests:

```bash
# Test registration
./test/curl/01-register-users.sh

# Test login and token generation
./test/curl/02-login-users.sh

# Test protected endpoints
./test/curl/03-protected-endpoints.sh

# Test error scenarios
./test/curl/04-error-scenarios.sh
```

### Manual Testing

```bash
# 1. Register a user
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 2. Login and get token
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 3. Use token (replace with actual token)
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Common Issues

1. **"Authorization header required"**
   - Missing Authorization header
   - Incorrect header format (should be `Bearer <token>`)

2. **"Invalid token"**
   - Token is malformed or corrupted
   - Token was generated with different secret
   - Token signature verification failed

3. **"Token expired"**
   - Token has passed its expiration time
   - User needs to login again

4. **"User not found"**
   - Valid token but user was deleted
   - Token contains invalid user ID

### Debug Token Issues

```bash
# Decode JWT token (without verification)
echo "YOUR_TOKEN_HERE" | cut -d. -f2 | base64 -d | jq

# Check token expiration
node -e "console.log(new Date(JSON.parse(atob('PAYLOAD_PART')).exp * 1000))"
```

## Future Enhancements

### Planned Features

1. **Refresh Tokens**
   - Implement refresh token flow
   - Allow token renewal without re-login

2. **Token Blacklisting**
   - Maintain revoked token list
   - Implement logout functionality

3. **Multi-Factor Authentication**
   - TOTP support
   - SMS verification

4. **OAuth2 Integration**
   - Google/GitHub/Facebook login
   - Social authentication

5. **Role-Based Access Control**
   - User roles and permissions
   - Resource-based authorization