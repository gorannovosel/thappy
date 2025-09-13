# Frontend API Integration Guide

Comprehensive guide for integrating with the Thappy backend API from the React frontend.

## Overview

This guide covers how to interact with the backend API, handle authentication, manage errors, and implement best practices for API integration in the frontend application.

## API Service Layer

### Architecture

The frontend uses a service layer pattern to abstract API calls:

```
src/services/
├── clientProfile.ts      # Client profile operations
├── therapistDiscovery.ts # Public therapist data
└── auth.ts              # Authentication services (planned)
```

### Base Configuration

```typescript
// src/utils/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

## Authentication Integration

### JWT Token Management

```typescript
// Token storage and retrieval
const tokenUtils = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  remove: () => localStorage.removeItem('token'),

  // Decode token (client-side only for UI, not security)
  decode: (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
};
```

### Authentication Hook

```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      // Store token and user
      tokenUtils.set(data.token);
      setUser(data.user);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, login, logout, register };
};
```

### Protected API Calls

```typescript
// Generic API call function with auth
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    tokenUtils.remove();
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};
```

## API Service Implementation

### Client Profile Service

```typescript
// src/services/clientProfile.ts
export const clientProfileApi = {
  async createProfile(data: CreateClientProfileRequest): Promise<ClientProfileResponse> {
    return apiCall('/api/client/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProfile(): Promise<ClientProfileResponse> {
    return apiCall('/api/client/profile/get');
  },

  async updatePersonalInfo(data: UpdatePersonalInfoRequest): Promise<ClientProfileResponse> {
    return apiCall('/api/client/profile/personal-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateContactInfo(data: UpdateContactInfoRequest): Promise<ClientProfileResponse> {
    return apiCall('/api/client/profile/contact-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setDateOfBirth(data: SetDateOfBirthRequest): Promise<ClientProfileResponse> {
    return apiCall('/api/client/profile/date-of-birth', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProfile(): Promise<{ message: string }> {
    return apiCall('/api/client/profile/delete', {
      method: 'DELETE',
    });
  },
};
```

### Therapist Discovery Service

```typescript
// src/services/therapistDiscovery.ts
export const therapistDiscoveryApi = {
  async getAcceptingTherapists(): Promise<TherapistsResponse> {
    return apiCall('/api/therapists/accepting');
  },
};
```

## Error Handling

### API Error Types

```typescript
// src/types/api.ts
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Error Handler Utility

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    // Handle specific API errors
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request data';
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 409:
        return error.message || 'This resource already exists';
      case 422:
        return error.message || 'Please check your input data';
      case 500:
        return 'A server error occurred. Please try again later';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
```

### React Error Boundary

```typescript
// src/components/common/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Real-time Data Handling

### Async Hook for API Calls

```typescript
// src/hooks/useAsync.ts
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};
```

### Usage in Components

```typescript
// Component example
const ClientDashboard: React.FC = () => {
  const { data: profile, loading, error, refetch } = useAsync(
    () => clientProfileApi.getProfile(),
    []
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!profile) return <CreateProfileForm />;

  return <ProfileDisplay profile={profile.profile} />;
};
```

## Form Handling with API Integration

### Form Validation Hook

```typescript
// src/hooks/useFormValidation.ts
export const useFormValidation = <T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) => {
  // ... validation logic

  const submit = async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true);

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        await onSubmit(values);
        // Success handled by component
      } catch (error) {
        // Add server validation errors to form
        const serverError = handleApiError(error);
        setErrors({ _form: [serverError] });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return { submit, /* ...other form methods */ };
};
```

### Form Component Example

```typescript
// Profile form with API integration
const EditProfileForm: React.FC = () => {
  const { addNotification } = useNotifications();
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    submit
  } = useFormValidation({
    initialValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
    validationRules: {
      first_name: [{ required: true, message: 'First name is required' }],
      last_name: [{ required: true, message: 'Last name is required' }],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit(async (formData) => {
      const response = await clientProfileApi.updatePersonalInfo(formData);
      setProfile(response.profile);
      addNotification({
        type: 'success',
        message: 'Profile updated successfully',
      });
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="first_name"
        value={values.first_name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.first_name && (
        <span className="error">{errors.first_name[0]}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};
```

## API Response Type Safety

### Type Definitions

```typescript
// src/types/api.ts - Complete type definitions
export interface User {
  id: string;
  email: string;
  role: 'client' | 'therapist';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  emergency_contact: string;
  date_of_birth: string | null;
  therapist_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TherapistProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  bio: string;
  specializations: string[];
  accepting_clients: boolean;
  created_at: string;
  updated_at: string;
}

// API Response wrappers
export interface ApiResponse {
  message: string;
  error?: string;
}

export interface AuthResponse extends ApiResponse {
  token: string;
  user: User;
}

export interface ClientProfileResponse extends ApiResponse {
  profile: ClientProfile;
}

export interface TherapistsResponse extends ApiResponse {
  therapists: TherapistProfile[];
}
```

### Generic API Response Handler

```typescript
// Type-safe response handler
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData.code,
      errorData.details
    );
  }

  return response.json();
};
```

## Performance Optimization

### Request Caching

```typescript
// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Usage in API calls
export const getTherapistsWithCache = async (): Promise<TherapistsResponse> => {
  const cacheKey = 'therapists-accepting';

  // Try cache first
  const cached = getCachedData<TherapistsResponse>(cacheKey);
  if (cached) return cached;

  // Fetch and cache
  const response = await therapistDiscoveryApi.getAcceptingTherapists();
  setCachedData(cacheKey, response);
  return response;
};
```

### Request Debouncing

```typescript
// Debounced search hook
const useDebouncedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return debouncedTerm;
};

// Usage in search component
const TherapistSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedSearch(searchTerm);

  const { data: therapists, loading } = useAsync(
    () => searchTherapists(debouncedSearch),
    [debouncedSearch]
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search therapists..."
      />
      {loading ? <LoadingSpinner /> : <TherapistList therapists={therapists} />}
    </div>
  );
};
```

## Testing API Integration

### Mock API Responses

```typescript
// src/utils/testHelpers.ts
export const mockApiResponse = <T>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message: string, status = 500, delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ApiError(message, status)), delay);
  });
};

// Mock service for testing
export const mockClientProfileApi = {
  getProfile: jest.fn(() =>
    mockApiResponse({
      profile: mockClientProfile,
      message: 'Profile retrieved successfully'
    })
  ),

  updatePersonalInfo: jest.fn((data) =>
    mockApiResponse({
      profile: { ...mockClientProfile, ...data },
      message: 'Profile updated successfully'
    })
  ),
};
```

### Testing Components with API Calls

```typescript
// Component test example
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientDashboard } from './ClientDashboard';
import * as clientProfileApi from '../services/clientProfile';

// Mock the API module
jest.mock('../services/clientProfile');
const mockClientProfileApi = clientProfileApi.clientProfileApi as jest.Mocked<typeof clientProfileApi.clientProfileApi>;

describe('ClientDashboard', () => {
  it('displays profile data when loaded', async () => {
    mockClientProfileApi.getProfile.mockResolvedValue({
      profile: {
        user_id: '1',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-123-4567',
        emergency_contact: 'Jane Doe',
        date_of_birth: null,
        therapist_id: null,
        notes: '',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      message: 'Success',
    });

    render(<ClientDashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(mockClientProfileApi.getProfile).toHaveBeenCalledTimes(1);
  });

  it('handles API errors gracefully', async () => {
    mockClientProfileApi.getProfile.mockRejectedValue(
      new Error('Network error')
    );

    render(<ClientDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });
});
```

## Environment Configuration

### Development vs Production

```typescript
// src/utils/config.ts
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Cache configuration
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum cache entries
  },
};

// Request timeout wrapper
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeout = config.api.timeout
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );

  return Promise.race([promise, timeoutPromise]);
};
```

### CORS Configuration

For development, the backend should include CORS headers. In production, use nginx or similar proxy:

```nginx
# nginx.conf for production
location /api/ {
    proxy_pass http://backend:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS headers if needed
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
}
```

## Best Practices

### 1. Error Handling
- Always handle both network and application errors
- Provide meaningful error messages to users
- Log errors for debugging (not sensitive information)
- Use error boundaries for React component errors

### 2. Loading States
- Show loading indicators for API calls
- Disable forms during submission
- Provide feedback for long-running operations
- Use skeleton screens for better UX

### 3. Type Safety
- Use TypeScript interfaces for all API data
- Validate response data structure
- Handle nullable and optional fields properly
- Use generic types for reusable API functions

### 4. Performance
- Cache frequently accessed data
- Debounce user input for search/filtering
- Use React.memo for expensive components
- Lazy load components and data when possible

### 5. Security
- Never store sensitive data in localStorage
- Validate all user inputs
- Handle token expiration gracefully
- Use HTTPS in production
- Sanitize data from API responses

### 6. Testing
- Mock API calls in tests
- Test both success and error scenarios
- Use integration tests for critical user flows
- Test accessibility and keyboard navigation

## Troubleshooting

### Common API Integration Issues

#### 1. CORS Errors
```
Access to fetch at 'http://localhost:8080/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: Configure CORS in backend or use proxy in development

#### 2. 401 Unauthorized Errors
**Causes**:
- Missing or expired JWT token
- Incorrect token format
- Server-side token validation issues

**Solution**: Check token storage, implement token refresh, verify token format

#### 3. Network Timeout Errors
**Causes**:
- Backend service down
- Network connectivity issues
- Long-running API operations

**Solution**: Implement retry logic, show appropriate error messages, check backend logs

#### 4. Type Errors
```
Property 'user_id' does not exist on type 'ClientProfile'
```
**Solution**: Verify API response structure matches TypeScript interfaces

### Debugging Tips

1. **Use Browser DevTools Network Tab**: Monitor API requests and responses
2. **Console Logging**: Add temporary logs for request/response data
3. **React DevTools**: Inspect component state and context values
4. **Backend Logs**: Check server logs for API errors
5. **Postman/Insomnia**: Test API endpoints independently

---

This guide provides comprehensive coverage of frontend API integration patterns used in the Thappy application. For additional support, refer to the backend [API Reference](../api/README.md) and [Development Setup](../development/setup.md) guides.