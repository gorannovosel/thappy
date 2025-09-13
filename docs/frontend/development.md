# Frontend Development Guide

Complete guide for developing and maintaining the Thappy React TypeScript frontend.

## Development Environment Setup

### Prerequisites

#### Required Software
1. **Node.js 16+**
   ```bash
   # Check version
   node --version
   npm --version

   # Install from https://nodejs.org/ if needed
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Docker & Docker Compose** (for full-stack development)
   ```bash
   docker --version
   docker-compose --version
   ```

#### Recommended Tools
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - React Developer Tools (browser extension)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd thappy

# Install frontend dependencies
make frontend-install

# Start development server
make frontend-dev

# Or start full-stack development
make dev-full
```

### Development Commands

```bash
# Core development
make frontend-install          # Install dependencies
make frontend-dev             # Start dev server (localhost:3000)
make frontend-build           # Production build
make frontend-test            # Run tests

# Code quality
make frontend-lint            # Check code quality
make frontend-lint-fix        # Fix linting issues
make frontend-format          # Format code with Prettier
make frontend-format-check    # Check formatting
make frontend-type-check      # TypeScript type checking

# Combined workflows
make frontend-ci             # Full CI pipeline (lint + format + type + test)
make dev-full               # Start both backend and frontend
make build-all              # Build both backend and frontend
```

## Project Structure Deep Dive

### Directory Organization

```
frontend/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── favicon.ico            # Favicon
├── src/                       # Source code
│   ├── components/            # React components
│   │   ├── common/           # Shared UI components
│   │   ├── auth/             # Authentication components
│   │   ├── client/           # Client-specific components
│   │   └── public/           # Public-facing components
│   ├── pages/                # Route-level components
│   │   ├── auth/             # Login/register pages
│   │   ├── client/           # Client dashboard pages
│   │   ├── therapist/        # Therapist dashboard pages
│   │   └── public/           # Public pages
│   ├── context/              # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service layer
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles and utilities
├── .env.development          # Development environment variables
├── .env.production          # Production environment variables
├── .prettierrc              # Prettier configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── Dockerfile               # Production container build
└── nginx.conf               # Production nginx configuration
```

### Component Architecture

#### Component Categories

1. **Common Components** (`src/components/common/`)
   - Reusable UI elements used across the application
   - Examples: LoadingSpinner, Toast, ErrorBoundary, Header

2. **Feature Components** (`src/components/{auth,client,public}/`)
   - Domain-specific components grouped by feature area
   - Examples: LoginForm, CreateProfileForm, TherapistCard

3. **Page Components** (`src/pages/`)
   - Top-level route components that compose other components
   - Examples: HomePage, ClientDashboard, TherapistsPage

#### Component Naming Conventions

```typescript
// Component files: PascalCase with descriptive names
LoadingSpinner.tsx
CreateProfileForm.tsx
TherapistCard.tsx

// CSS Modules: Same name as component
LoadingSpinner.module.css
CreateProfileForm.module.css
TherapistCard.module.css

// Test files: Component name + .test.tsx
LoadingSpinner.test.tsx
CreateProfileForm.test.tsx
TherapistCard.test.tsx
```

## TypeScript Development

### Type Organization

```typescript
// src/types/api.ts - API-related types
export interface User {
  id: string;
  email: string;
  role: 'client' | 'therapist';
  // ...
}

// src/types/ui.ts - UI-specific types
export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  // ...
}

// Component-specific types (inline)
interface CreateProfileFormProps {
  onSuccess: (profile: ClientProfile) => void;
  onCancel: () => void;
}
```

### TypeScript Best Practices

1. **Strict Type Checking**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "noImplicitReturns": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

2. **Interface vs Type**
   ```typescript
   // Use interfaces for object shapes that might be extended
   interface BaseProfile {
     id: string;
     name: string;
   }

   interface ClientProfile extends BaseProfile {
     therapist_id: string | null;
   }

   // Use types for unions, computed types, etc.
   type UserRole = 'client' | 'therapist';
   type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
   ```

3. **Generic Types for Reusability**
   ```typescript
   // Generic API response wrapper
   interface ApiResponse<T> {
     data: T;
     message: string;
     error?: string;
   }

   // Generic form hook
   function useFormValidation<T extends Record<string, any>>(
     options: UseFormValidationOptions<T>
   ) {
     // Implementation
   }
   ```

4. **Utility Types**
   ```typescript
   // Make all properties optional for updates
   type UpdateProfileRequest = Partial<CreateProfileRequest>;

   // Pick specific properties
   type UserSummary = Pick<User, 'id' | 'email' | 'role'>;

   // Omit properties
   type CreateUserRequest = Omit<User, 'id' | 'created_at' | 'updated_at'>;
   ```

## React Development Patterns

### Functional Components with Hooks

```typescript
// Standard functional component pattern
const CreateProfileForm: React.FC<CreateProfileFormProps> = ({
  onSuccess,
  onCancel
}) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const { addNotification } = useNotifications();
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    submit
  } = useFormValidation({
    initialValues: {
      first_name: '',
      last_name: '',
      phone: '',
      emergency_contact: '',
    },
    validationRules: profileValidationRules,
  });

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit(async (formData) => {
      setIsSubmitting(true);
      try {
        const response = await clientProfileApi.createProfile(formData);
        addNotification({
          type: 'success',
          message: 'Profile created successfully!',
        });
        onSuccess(response.profile);
      } catch (error) {
        // Error handling in form validation hook
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // Render
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Form content */}
    </form>
  );
};

export default CreateProfileForm;
```

### Custom Hooks Development

#### State Management Hook
```typescript
// src/hooks/useAsync.ts
export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
};
```

#### Form Validation Hook
```typescript
// src/hooks/useFormValidation.ts
export const useFormValidation = <T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) => {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});

  const validateField = useCallback((fieldName: keyof T, value: string) => {
    const rules = options.validationRules?.[fieldName];
    if (!rules) return [];

    const fieldErrors: string[] = [];

    for (const rule of rules) {
      if (rule.required && !value.trim()) {
        fieldErrors.push(rule.message || `${String(fieldName)} is required`);
        break;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(
          rule.message || `Minimum ${rule.minLength} characters required`
        );
      }

      // Additional validation rules...
    }

    return fieldErrors;
  }, [options.validationRules]);

  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    if (options.validateOnChange) {
      const fieldErrors = validateField(fieldName, String(value || ''));
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: fieldErrors.length > 0 ? fieldErrors : undefined,
      }));
    }
  }, [validateField, options.validateOnChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValue(name as keyof T, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));

      if (options.validateOnBlur) {
        const fieldErrors = validateField(name as keyof T, values[name] || '');
        setErrors(prev => ({
          ...prev,
          [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
        }));
      }
    },
    [validateField, values, options.validateOnBlur]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    handleChange,
    handleBlur,
    submit,
    reset,
    // ... other form methods
  };
};
```

### Context and State Management

```typescript
// src/context/AuthContext.tsx
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Validate token with backend
          const user = await validateToken(token);
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem('token');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    // Implementation
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Styling and CSS

### CSS Modules Pattern

```css
/* CreateProfileForm.module.css */
.form {
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.fieldGroup {
  margin-bottom: var(--spacing-md);
}

.label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-duration) ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

.input.error {
  border-color: var(--color-error);
}

.errorMessage {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.buttonGroup {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-duration) ease;
}

.buttonPrimary {
  background-color: var(--color-primary);
  color: white;
}

.buttonPrimary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.buttonSecondary {
  background-color: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.buttonSecondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .form {
    margin: var(--spacing-sm);
    padding: var(--spacing-md);
  }

  .buttonGroup {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
```

### CSS Variables System

```css
/* src/styles/variables.css */
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-primary-light: #93c5fd;
  --color-primary-alpha: rgba(59, 130, 246, 0.1);

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-text-light: #9ca3af;

  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-border: #e5e7eb;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-duration: 150ms;
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-index */
  --z-index-dropdown: 100;
  --z-index-modal: 200;
  --z-index-toast: 300;
  --z-index-tooltip: 400;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f9fafb;
    --color-text-muted: #d1d5db;
    --color-background: #111827;
    --color-surface: #1f2937;
    --color-bg-secondary: #374151;
    --color-border: #4b5563;
  }
}
```

### Responsive Design Utilities

```css
/* src/styles/responsive.css */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.grid {
  display: grid;
  gap: var(--spacing-md);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (min-width: 640px) {
  .sm\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 768px) {
  .md\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  .lg\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

/* Flexbox utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

/* Spacing utilities */
.m-0 { margin: 0; }
.m-auto { margin: auto; }
.mt-auto { margin-top: auto; }
.mb-auto { margin-bottom: auto; }

.p-0 { padding: 0; }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }

.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }

/* Display utilities */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }

@media (max-width: 639px) {
  .sm-hidden { display: none; }
}

@media (max-width: 767px) {
  .md-hidden { display: none; }
}

@media (max-width: 1023px) {
  .lg-hidden { display: none; }
}
```

## Testing Strategy

### Testing Philosophy
- **Test behavior, not implementation**: Focus on what the component does, not how it does it
- **User-centric testing**: Test from the user's perspective using React Testing Library
- **Integration over unit**: Prefer testing component integration over isolated units
- **Accessibility testing**: Ensure components work with screen readers and keyboard navigation

### Test File Organization

```bash
# Component tests alongside components
src/components/common/LoadingSpinner.test.tsx
src/components/auth/LoginForm.test.tsx
src/components/client/CreateProfileForm.test.tsx

# Hook tests
src/hooks/useAuth.test.ts
src/hooks/useFormValidation.test.ts

# Utility tests
src/utils/errorHandler.test.ts
src/utils/performance.test.ts

# Page integration tests
src/pages/client/ClientDashboard.test.tsx
src/pages/public/TherapistsPage.test.tsx
```

### Component Testing Patterns

#### Basic Component Test
```typescript
// LoadingSpinner.test.tsx
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Saving profile..." />);
    expect(screen.getByText('Saving profile...')).toBeInTheDocument();
  });

  it('renders large size correctly', () => {
    render(<LoadingSpinner size="large" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('large');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });
});
```

#### Form Component Test
```typescript
// CreateProfileForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProfileForm from './CreateProfileForm';
import * as clientProfileApi from '../../services/clientProfile';

// Mock the API
jest.mock('../../services/clientProfile');
const mockClientProfileApi = clientProfileApi.clientProfileApi as jest.Mocked<typeof clientProfileApi.clientProfileApi>;

const mockProps = {
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
};

describe('CreateProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<CreateProfileForm {...mockProps} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emergency contact/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CreateProfileForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockProfile = {
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
    };

    mockClientProfileApi.createProfile.mockResolvedValue({
      profile: mockProfile,
      message: 'Profile created successfully',
    });

    render(<CreateProfileForm {...mockProps} />);

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/phone/i), '555-123-4567');
    await user.type(screen.getByLabelText(/emergency contact/i), 'Jane Doe');

    // Submit
    await user.click(screen.getByRole('button', { name: /create profile/i }));

    await waitFor(() => {
      expect(mockClientProfileApi.createProfile).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-123-4567',
        emergency_contact: 'Jane Doe',
      });
    });

    expect(mockProps.onSuccess).toHaveBeenCalledWith(mockProfile);
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockClientProfileApi.createProfile.mockRejectedValue(
      new Error('Email already exists')
    );

    render(<CreateProfileForm {...mockProps} />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.click(screen.getByRole('button', { name: /create profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    mockClientProfileApi.createProfile.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<CreateProfileForm {...mockProps} />);

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');

    // Submit
    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/creating profile/i)).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// useFormValidation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';

describe('useFormValidation', () => {
  const initialValues = {
    first_name: '',
    last_name: '',
    email: '',
  };

  const validationRules = {
    first_name: [{ required: true, message: 'First name is required' }],
    last_name: [{ required: true, message: 'Last name is required' }],
    email: [
      { required: true, message: 'Email is required' },
      { email: true, message: 'Please enter a valid email' },
    ],
  };

  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('updates values when setValue is called', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    act(() => {
      result.current.setValue('first_name', 'John');
    });

    expect(result.current.values.first_name).toBe('John');
  });

  it('validates fields when touched', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules,
        validateOnBlur: true,
      })
    );

    act(() => {
      result.current.setTouched('first_name', true);
    });

    expect(result.current.errors.first_name).toEqual(['First name is required']);
    expect(result.current.isValid).toBe(false);
  });

  it('validates email format', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules,
        validateOnChange: true,
      })
    );

    act(() => {
      result.current.setValue('email', 'invalid-email');
    });

    expect(result.current.errors.email).toContain('Please enter a valid email');
  });

  it('submits form when valid', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    // Set valid values
    act(() => {
      result.current.setValue('first_name', 'John');
      result.current.setValue('last_name', 'Doe');
      result.current.setValue('email', 'john@example.com');
    });

    await act(async () => {
      await result.current.submit(onSubmit);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });
  });
});
```

### Testing Utilities

```typescript
// src/utils/testHelpers.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

// Custom render function with providers
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  role: 'client' as const,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockClientProfile = (overrides = {}) => ({
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
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message: string, status = 500): Promise<never> => {
  return Promise.reject(new Error(message));
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };
```

## Performance Optimization

### React Performance Patterns

#### Memoization
```typescript
// Component memoization
const TherapistCard = React.memo<TherapistCardProps>(({ therapist, onContact }) => {
  return (
    <div className={styles.card}>
      <h3>{therapist.first_name} {therapist.last_name}</h3>
      <p>{therapist.bio}</p>
      <button onClick={() => onContact(therapist)}>
        Contact Therapist
      </button>
    </div>
  );
});

// Hook memoization
const useFilteredTherapists = (therapists: TherapistProfile[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return therapists;

    return therapists.filter(therapist =>
      therapist.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.specializations.some(spec =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [therapists, searchTerm]);
};

// Callback memoization
const TherapistsList: React.FC<{ therapists: TherapistProfile[] }> = ({ therapists }) => {
  const { addNotification } = useNotifications();

  const handleContact = useCallback((therapist: TherapistProfile) => {
    addNotification({
      type: 'info',
      message: `Contact ${therapist.first_name} ${therapist.last_name} at ${therapist.phone}`,
    });
  }, [addNotification]);

  return (
    <div>
      {therapists.map(therapist => (
        <TherapistCard
          key={therapist.user_id}
          therapist={therapist}
          onContact={handleContact}
        />
      ))}
    </div>
  );
};
```

#### Code Splitting and Lazy Loading
```typescript
// Route-level code splitting
import { lazy, Suspense } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load route components
const ClientDashboard = lazy(() => import('../pages/client/ClientDashboard'));
const TherapistDashboard = lazy(() => import('../pages/therapist/TherapistDashboard'));
const TherapistsPage = lazy(() => import('../pages/public/TherapistsPage'));

// App routing with suspense
function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/client/dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ClientDashboard />
            </Suspense>
          }
        />
        <Route
          path="/therapist/dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TherapistDashboard />
            </Suspense>
          }
        />
        <Route
          path="/therapists"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TherapistsPage />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

// Component-level lazy loading
const LazyTherapistDirectory = lazy(() =>
  import('./TherapistDirectory').then(module => ({
    default: module.TherapistDirectory
  }))
);
```

#### Virtual Scrolling for Large Lists
```typescript
// src/hooks/useVirtualScroll.ts
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = useMemo(
    () => items.slice(visibleStart, visibleEnd),
    [items, visibleStart, visibleEnd]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
};

// Usage in component
const VirtualTherapistList: React.FC<{ therapists: TherapistProfile[] }> = ({ therapists }) => {
  const containerHeight = 400;
  const itemHeight = 120;

  const { visibleItems, totalHeight, offsetY, onScroll } = useVirtualScroll(
    therapists,
    itemHeight,
    containerHeight
  );

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((therapist, index) => (
            <div
              key={therapist.user_id}
              style={{ height: itemHeight }}
            >
              <TherapistCard therapist={therapist} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Bundle Optimization

#### Analyze Bundle Size
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Add script to package.json
"analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"

# Run analysis
npm run analyze
```

#### Tree Shaking
```typescript
// Good: Import only what you need
import { debounce } from 'lodash/debounce';

// Bad: Imports entire library
import _ from 'lodash';

// Good: Named imports from React
import { useState, useEffect, useCallback } from 'react';

// Bad: Default import
import React from 'react';
```

## Debugging and Development Tools

### Browser DevTools Setup

#### React Developer Tools
```bash
# Install React DevTools browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

#### Debugging Hooks
```typescript
// Debug custom hooks
export const useFormValidation = <T extends Record<string, any>>(
  options: UseFormValidationOptions<T>
) => {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('useFormValidation');
      console.log('values:', values);
      console.log('errors:', errors);
      console.groupEnd();
    }
  }, [values, errors]);

  // ... rest of hook implementation
};
```

### Error Monitoring

#### Development Error Logging
```typescript
// src/utils/logger.ts
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  extra?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogEntry['level'], message: string, extra?: any) {
    const entry: LogEntry = {
      level,
      message,
      extra,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      console[level](
        `[${entry.timestamp}] ${entry.message}`,
        entry.extra || ''
      );
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // this.sendToMonitoringService(entry);
    }

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  info(message: string, extra?: any) {
    this.log('info', message, extra);
  }

  warn(message: string, extra?: any) {
    this.log('warn', message, extra);
  }

  error(message: string, error?: Error) {
    this.log('error', message, {
      stack: error?.stack,
      name: error?.name,
      message: error?.message,
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
```

### Development Workflow

#### Git Hooks Setup
```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup git hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "make frontend-ci"

# Add commit message hook
npx husky add .husky/commit-msg 'npx commitlint --edit "$1"'
```

#### Development Scripts
```json
{
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "test:ci": "CI=true react-scripts test --coverage --watchAll=false",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,json}\"",
    "type-check": "tsc --noEmit",
    "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "storybook": "start-storybook -p 6006",
    "build-storybook": "build-storybook"
  }
}
```

## Deployment and Production

### Build Configuration

#### Environment Variables
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_LOG_LEVEL=debug

# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=error
```

#### Production Optimizations
```typescript
// src/utils/config.ts
export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL!,
    timeout: process.env.NODE_ENV === 'production' ? 10000 : 30000,
  },

  features: {
    enableDevTools: process.env.NODE_ENV === 'development',
    enableLogging: process.env.REACT_APP_LOG_LEVEL !== 'none',
    enableAnalytics: process.env.NODE_ENV === 'production',
  },

  performance: {
    enableServiceWorker: process.env.NODE_ENV === 'production',
    cacheStaticAssets: process.env.NODE_ENV === 'production',
  },
};
```

### Docker Production Build

#### Multi-stage Dockerfile
```dockerfile
# frontend/Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Production nginx Configuration
```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy
        location /api/ {
            proxy_pass http://api:8080/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # React Router support
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## Troubleshooting Common Issues

### Development Issues

#### 1. Module Resolution Errors
```bash
# Problem: Cannot resolve module './Component'
# Solution: Check file extensions and import paths

# TypeScript absolute imports setup
# tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/utils/*": ["utils/*"]
    }
  }
}
```

#### 2. Type Declaration Issues
```typescript
// Problem: Property 'customProp' does not exist on type 'HTMLDivElement'
// Solution: Extend HTML element types

// src/types/declarations.d.ts
declare namespace React {
  interface HTMLAttributes<T> {
    customProp?: string;
  }
}

// Or use data attributes
interface CustomProps {
  'data-testid'?: string;
  'data-custom'?: string;
}
```

#### 3. CSS Module Issues
```bash
# Problem: Cannot find module './Component.module.css'
# Solution: Add CSS module type declarations

# src/types/css-modules.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

### Performance Issues

#### 1. Slow Re-renders
```typescript
// Problem: Component re-renders too frequently
// Solution: Use React DevTools Profiler and add memoization

// Debug re-renders
const MyComponent = React.memo((props) => {
  useEffect(() => {
    console.log('MyComponent rendered', props);
  });

  return <div>{/* component content */}</div>;
});

// Check props equality
const areEqual = (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

export default React.memo(MyComponent, areEqual);
```

#### 2. Large Bundle Size
```bash
# Analyze bundle
npm run analyze

# Common solutions:
# 1. Use dynamic imports
const LazyComponent = lazy(() => import('./LazyComponent'));

# 2. Import only needed functions
import debounce from 'lodash/debounce';

# 3. Use webpack bundle analyzer to find large dependencies
```

### API Integration Issues

#### 1. CORS Errors in Development
```javascript
// Problem: CORS errors when calling backend
// Solution: Add proxy to package.json

// package.json
{
  "name": "frontend",
  "proxy": "http://localhost:8080",
  // ... rest of package.json
}

// Or use setupProxy.js
// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );
};
```

#### 2. Authentication Token Issues
```typescript
// Problem: Token not being sent with requests
// Solution: Verify token storage and headers

// Debug token
const debugAuth = () => {
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expired:', payload.exp < Date.now() / 1000);
    } catch (error) {
      console.error('Invalid token format:', error);
    }
  }
};
```

### Testing Issues

#### 1. React Testing Library Queries
```typescript
// Problem: Unable to find element by text/role
// Solution: Use appropriate queries and debug

// Debug what's in the DOM
import { screen } from '@testing-library/react';

test('debug example', () => {
  render(<MyComponent />);

  // See what's rendered
  screen.debug();

  // Use getAllBy* to see multiple matches
  const buttons = screen.getAllByRole('button');
  console.log('Found buttons:', buttons.length);

  // Use query functions for optional elements
  const optionalElement = screen.queryByText('Maybe present');
  expect(optionalElement).toBeNull();
});
```

#### 2. Async Testing Issues
```typescript
// Problem: Test failing due to async operations
// Solution: Use waitFor and findBy* queries

test('async operations', async () => {
  render(<ComponentWithAsyncData />);

  // Wait for element to appear
  const data = await screen.findByText('Loaded data');
  expect(data).toBeInTheDocument();

  // Wait for multiple async operations
  await waitFor(() => {
    expect(screen.getByText('First async result')).toBeInTheDocument();
    expect(screen.getByText('Second async result')).toBeInTheDocument();
  });

  // Wait with custom timeout
  await waitFor(
    () => expect(screen.getByText('Slow loading')).toBeInTheDocument(),
    { timeout: 5000 }
  );
});
```

---

This development guide provides comprehensive coverage of frontend development practices for the Thappy application. For additional support, refer to the [API Integration Guide](api-integration.md) and [Architecture Overview](../architecture/overview.md).