package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	userDomain "github.com/goran/thappy/internal/domain/user"
)

// MockUserService implements userDomain.UserService for testing
type MockUserService struct {
	users          map[string]*userDomain.User
	shouldFailNext bool
	failError      error
}

func NewMockUserService() *MockUserService {
	return &MockUserService{
		users: make(map[string]*userDomain.User),
	}
}

func (m *MockUserService) Register(ctx context.Context, email, password string) (*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	user, err := userDomain.NewUser(email, password)
	if err != nil {
		return nil, err
	}

	// Check if user already exists
	for _, u := range m.users {
		if u.Email == email {
			return nil, userDomain.ErrUserAlreadyExists
		}
	}

	m.users[user.ID] = user
	return user, nil
}

func (m *MockUserService) Login(ctx context.Context, email, password string) (string, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return "", m.failError
	}

	for _, user := range m.users {
		if user.Email == email && user.ValidatePassword(password) {
			return "mock-token-" + user.ID, nil
		}
	}

	return "", userDomain.ErrInvalidCredentials
}

func (m *MockUserService) GetUserByID(ctx context.Context, id string) (*userDomain.User, error) {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return nil, m.failError
	}

	if user, exists := m.users[id]; exists {
		return user, nil
	}
	return nil, userDomain.ErrUserNotFound
}

func (m *MockUserService) UpdateUser(ctx context.Context, user *userDomain.User) error {
	if m.shouldFailNext {
		m.shouldFailNext = false
		return m.failError
	}

	if _, exists := m.users[user.ID]; !exists {
		return userDomain.ErrUserNotFound
	}

	m.users[user.ID] = user
	return nil
}

func (m *MockUserService) SetNextError(err error) {
	m.shouldFailNext = true
	m.failError = err
}

func TestUserHandler_Register(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    interface{}
		setupMock      func(*MockUserService)
		expectedStatus int
		expectedBody   map[string]interface{}
		checkResponse  func(t *testing.T, resp *httptest.ResponseRecorder)
	}{
		{
			name: "successful registration",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "SecurePass123!",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				user, ok := response["user"].(map[string]interface{})
				if !ok {
					t.Error("Response should contain user object")
					return
				}

				if user["email"] != "test@example.com" {
					t.Errorf("Expected email test@example.com, got %v", user["email"])
				}

				if user["id"] == nil || user["id"] == "" {
					t.Error("User should have an ID")
				}

				if user["password_hash"] != nil {
					t.Error("Password hash should not be exposed")
				}
			},
		},
		{
			name: "registration with existing email",
			requestBody: map[string]string{
				"email":    "existing@example.com",
				"password": "SecurePass123!",
			},
			setupMock: func(m *MockUserService) {
				user, _ := userDomain.NewUser("existing@example.com", "OldPass123!")
				m.users[user.ID] = user
			},
			expectedStatus: http.StatusConflict,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "registration with invalid email",
			requestBody: map[string]string{
				"email":    "invalid-email",
				"password": "SecurePass123!",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "registration with short password",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "short",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "registration with missing email",
			requestBody: map[string]string{
				"password": "SecurePass123!",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "registration with missing password",
			requestBody: map[string]string{
				"email": "test@example.com",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name:           "registration with invalid JSON",
			requestBody:    "invalid json",
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "service error during registration",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "SecurePass123!",
			},
			setupMock: func(m *MockUserService) {
				m.SetNextError(errors.New("service unavailable"))
			},
			expectedStatus: http.StatusInternalServerError,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userService := NewMockUserService()
			tt.setupMock(userService)

			handler := NewUserHandler(userService)

			var body []byte
			var err error
			if str, ok := tt.requestBody.(string); ok {
				body = []byte(str)
			} else {
				body, err = json.Marshal(tt.requestBody)
				if err != nil {
					t.Fatalf("Failed to marshal request body: %v", err)
				}
			}

			req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			resp := httptest.NewRecorder()
			handler.Register(resp, req)

			if resp.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.Code)
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, resp)
			}
		})
	}
}

func TestUserHandler_Login(t *testing.T) {
	// Create test user
	testUser, _ := userDomain.NewUser("test@example.com", "TestPass123!")

	tests := []struct {
		name           string
		requestBody    interface{}
		setupMock      func(*MockUserService)
		expectedStatus int
		checkResponse  func(t *testing.T, resp *httptest.ResponseRecorder)
	}{
		{
			name: "successful login",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "TestPass123!",
			},
			setupMock: func(m *MockUserService) {
				m.users[testUser.ID] = testUser
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["token"] == nil || response["token"] == "" {
					t.Error("Response should contain token")
				}

				if !strings.HasPrefix(response["token"].(string), "mock-token-") {
					t.Error("Token should be properly formatted")
				}
			},
		},
		{
			name: "login with wrong password",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "WrongPass123!",
			},
			setupMock: func(m *MockUserService) {
				m.users[testUser.ID] = testUser
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "login with non-existent email",
			requestBody: map[string]string{
				"email":    "nonexistent@example.com",
				"password": "SomePass123!",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "login with missing email",
			requestBody: map[string]string{
				"password": "TestPass123!",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "login with missing password",
			requestBody: map[string]string{
				"email": "test@example.com",
			},
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name:           "login with invalid JSON",
			requestBody:    "invalid json",
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name: "service error during login",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "TestPass123!",
			},
			setupMock: func(m *MockUserService) {
				m.SetNextError(errors.New("service unavailable"))
			},
			expectedStatus: http.StatusInternalServerError,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userService := NewMockUserService()
			tt.setupMock(userService)

			handler := NewUserHandler(userService)

			var body []byte
			var err error
			if str, ok := tt.requestBody.(string); ok {
				body = []byte(str)
			} else {
				body, err = json.Marshal(tt.requestBody)
				if err != nil {
					t.Fatalf("Failed to marshal request body: %v", err)
				}
			}

			req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			resp := httptest.NewRecorder()
			handler.Login(resp, req)

			if resp.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.Code)
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, resp)
			}
		})
	}
}

func TestUserHandler_GetProfile(t *testing.T) {
	testUser, _ := userDomain.NewUser("profile@example.com", "TestPass123!")

	tests := []struct {
		name           string
		userID         string
		setupMock      func(*MockUserService)
		expectedStatus int
		checkResponse  func(t *testing.T, resp *httptest.ResponseRecorder)
	}{
		{
			name:   "successful get profile",
			userID: testUser.ID,
			setupMock: func(m *MockUserService) {
				m.users[testUser.ID] = testUser
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				user, ok := response["user"].(map[string]interface{})
				if !ok {
					t.Error("Response should contain user object")
					return
				}

				if user["email"] != testUser.Email {
					t.Errorf("Expected email %s, got %v", testUser.Email, user["email"])
				}

				if user["password_hash"] != nil {
					t.Error("Password hash should not be exposed")
				}
			},
		},
		{
			name:           "get profile for non-existent user",
			userID:         "non-existent-id",
			setupMock:      func(m *MockUserService) {},
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
		{
			name:   "service error during get profile",
			userID: testUser.ID,
			setupMock: func(m *MockUserService) {
				m.SetNextError(errors.New("service unavailable"))
			},
			expectedStatus: http.StatusInternalServerError,
			checkResponse: func(t *testing.T, resp *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(resp.Body.Bytes(), &response)
				if err != nil {
					t.Fatalf("Failed to unmarshal response: %v", err)
				}

				if response["error"] == nil {
					t.Error("Response should contain error message")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userService := NewMockUserService()
			tt.setupMock(userService)

			handler := NewUserHandler(userService)

			req := httptest.NewRequest(http.MethodGet, "/api/profile", nil)

			// Add user ID to context (simulating middleware)
			ctx := context.WithValue(req.Context(), "userID", tt.userID)
			req = req.WithContext(ctx)

			resp := httptest.NewRecorder()
			handler.GetProfile(resp, req)

			if resp.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, resp.Code)
			}

			if tt.checkResponse != nil {
				tt.checkResponse(t, resp)
			}
		})
	}
}
