# Testing Guide for Thappy Frontend

## Manual Testing Workflows

### 1. **Full Stack Testing** (Recommended for Development)

Start both backend and frontend:
```bash
make dev-full
```

This will:
- Start the Go backend API on `http://localhost:8080`
- Start the React frontend on `http://localhost:3000`
- Enable real API integration testing

### 2. **Test Scenarios**

#### A. **User Registration Flow**
1. Navigate to `http://localhost:3000/register`
2. Test cases:
   - **Valid client registration**: `client@test.com` / `TestPass123!` / Role: Client
   - **Valid therapist registration**: `therapist@test.com` / `TestPass123!` / Role: Therapist
   - **Invalid email**: `invalid-email` (should show validation error)
   - **Weak password**: `123` (should show strength requirements)
   - **Password mismatch**: Different passwords in confirm field
   - **Duplicate email**: Try registering same email twice

#### B. **User Login Flow**
1. Navigate to `http://localhost:3000/login`
2. Test cases:
   - **Valid credentials**: Use accounts created above
   - **Invalid credentials**: Wrong password
   - **Non-existent email**: `nonexistent@test.com`
   - **Missing fields**: Empty email or password
   - **Role-based redirect**: Client should go to client dashboard, therapist to therapist dashboard

#### C. **Authentication State**
1. **Logout functionality**: Click user dropdown → Sign Out
2. **Protected routes**: Try accessing `/profile` when logged out (should redirect to login)
3. **Token persistence**: Refresh page while logged in (should stay logged in)
4. **Role-based access**: Client trying to access therapist routes and vice versa

### 3. **Browser Developer Tools Testing**

#### Network Tab
- Check API calls to `http://localhost:8080/api/*`
- Verify JWT tokens in Authorization headers
- Monitor response status codes (200, 201, 400, 401, etc.)

#### Application Tab (localStorage)
- Check `thappy_token` and `thappy_user` storage
- Verify token gets cleared on logout

#### Console Tab
- Watch for any JavaScript errors
- Monitor authentication state changes

### 4. **API Testing with curl**

Test backend endpoints directly:

```bash
# Test registration
curl -X POST http://localhost:8080/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","role":"client"}'

# Test login
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Test protected endpoint (use token from login response)
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. **Test Data Setup**

Create test users for different scenarios:

```bash
# Client user
curl -X POST http://localhost:8080/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"TestPass123!","role":"client"}'

# Therapist user
curl -X POST http://localhost:8080/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{"email":"therapist@test.com","password":"TestPass123!","role":"therapist"}'

# Admin/test user
curl -X POST http://localhost:8080/api/register-with-role \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"TestPass123!","role":"therapist"}'
```

---

## Automated Testing Options

### 1. **React Testing Library** (Unit/Integration Tests)

```bash
# Run existing tests
make frontend-test

# Run tests in watch mode
cd frontend && npm test
```

### 2. **End-to-End Testing with Playwright** (Future)

```bash
# Install Playwright (not yet implemented)
npm install --save-dev @playwright/test

# Example E2E test structure:
test('user can register and login', async ({ page }) => {
  await page.goto('http://localhost:3000/register');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  // ... assertions
});
```

### 3. **API Integration Tests**

Your backend already has curl-based tests:
```bash
# Run backend API tests
./test/curl/run-all-tests.sh
```

---

## Common Issues & Debugging

### 1. **CORS Issues**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Make sure backend allows CORS from frontend origin

### 2. **Token Issues**
- Check token format in localStorage
- Verify token hasn't expired
- Ensure `Authorization: Bearer` header format

### 3. **Network Issues**
- Ensure backend is running on port 8080
- Check Docker containers: `docker-compose ps`
- View backend logs: `make logs-api`

### 4. **Form Validation Issues**
- Check browser console for validation errors
- Test edge cases (empty fields, special characters)
- Verify password strength requirements

---

## Test Checklist

### ✅ Registration Flow
- [ ] Client registration works
- [ ] Therapist registration works
- [ ] Validation errors display correctly
- [ ] Password confirmation works
- [ ] Duplicate email handling
- [ ] Successful redirect to dashboard

### ✅ Login Flow
- [ ] Valid credentials work
- [ ] Invalid credentials show errors
- [ ] Remember login state on refresh
- [ ] Role-based redirects work
- [ ] Return URL handling works

### ✅ Authentication State
- [ ] Logout clears tokens
- [ ] Protected routes redirect when not authenticated
- [ ] Role-based route protection works
- [ ] Token expiry handling works
- [ ] User dropdown shows correct information

### ✅ Error Handling
- [ ] Network errors display properly
- [ ] API errors show user-friendly messages
- [ ] Form validation provides clear feedback
- [ ] Loading states work correctly

### ✅ Cross-browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile responsive (DevTools)

---

## Performance Testing

### 1. **Bundle Size**
```bash
# Check build size
make frontend-build
# Look for bundle size warnings
```

### 2. **Network Performance**
- Monitor API response times in DevTools
- Check for unnecessary re-renders
- Verify efficient token management

### 3. **Memory Usage**
- Watch for memory leaks in long sessions
- Monitor React DevTools Profiler
- Check for proper cleanup on logout