# Sample User Testing

This directory contains testing tools for the sample user authentication system.

## Test Scripts

### `test-sample-logins.sh`

Comprehensive authentication test script that verifies:

- ✅ **Client user authentication** - Tests all 8 sample client accounts
- ✅ **Therapist user authentication** - Tests all 8 sample therapist accounts
- ✅ **JWT token functionality** - Verifies tokens work with protected endpoints
- ✅ **Invalid credential handling** - Tests wrong passwords are rejected
- ✅ **Inactive user handling** - Tests inactive users are properly handled

## Usage

### Prerequisites

1. Start the development environment:
   ```bash
   make dev
   ```

2. Ensure migrations are applied:
   ```bash
   make migrate-up
   ```

3. Verify sample data is loaded:
   ```bash
   make sample-data-status
   ```

### Running Tests

```bash
# Run authentication tests
./test/sample-users/test-sample-logins.sh
```

### Expected Output

The script will test login for each sample user and display:
- ✅ **GREEN** for successful logins
- ❌ **RED** for failed logins (unexpected)
- ⚠️ **YELLOW** for warnings (review needed)

### Sample Users Tested

#### Client Users (8 accounts)
- alice.client@example.com
- bob.client@example.com
- carol.client@example.com
- eve.client@example.com
- frank.client@example.com
- grace.client@example.com
- henry.client@example.com
- david.client@example.com (inactive - should be rejected)

#### Therapist Users (8 accounts)
- dr.smith@example.com
- dr.johnson@example.com
- dr.wilson@example.com
- dr.brown@example.com
- dr.davis@example.com
- dr.martinez@example.com
- dr.thompson@example.com
- dr.anderson@example.com

All users share the password: `TestPass123!`

## Manual Testing

### Test Individual Login

```bash
# Test client login
curl -X POST http://localhost:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice.client@example.com", "password": "TestPass123!"}'

# Test therapist login
curl -X POST http://localhost:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dr.smith@example.com", "password": "TestPass123!"}'
```

### Test Protected Endpoints

```bash
# Get JWT token from login response, then:
curl -X GET http://localhost:8081/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Verify Database State

```bash
# Check user accounts
make sample-data-status

# Direct database access
make db-shell
SELECT email, role, is_active FROM users WHERE email LIKE '%@example.com';
```

## Troubleshooting

### Tests Failing?

1. **Check API is running:**
   ```bash
   curl http://localhost:8081/health
   ```

2. **Verify sample data:**
   ```bash
   make sample-data-status
   ```

3. **Reset sample data:**
   ```bash
   make sample-data-reset
   ```

4. **Check database connection:**
   ```bash
   make db-shell
   \dt
   ```

### Common Issues

- **Connection refused**: API not running - run `make dev`
- **No sample users**: Migrations not applied - run `make migrate-up`
- **Wrong password**: Password hash mismatch - run `make sample-data-reset`
- **Inactive user access**: Review business logic for inactive user handling

## Integration with CI/CD

Add to your test pipeline:

```bash
# In CI/CD scripts
make dev &
sleep 10  # Wait for services to start
./test/sample-users/test-sample-logins.sh
```

## Security Notes

⚠️ **Development Only** - These sample users are for development/testing only:

- Shared password across all accounts
- Predictable user IDs
- Should not exist in production
- Environment checks should prevent production deployment