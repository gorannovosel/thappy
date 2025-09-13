# Frontend Documentation

Complete documentation for the Thappy React TypeScript frontend application.

## Overview

The Thappy frontend is a modern React TypeScript application that provides a complete user interface for the therapy platform. It features role-based authentication, responsive design, comprehensive error handling, and production-ready deployment capabilities.

## Technology Stack

- **React 18.3** - Modern React with hooks and functional components
- **TypeScript 4.9** - Full type safety and enhanced developer experience
- **CSS Modules** - Scoped styling with CSS variables
- **React Router 6** - Client-side routing with protected routes
- **React Testing Library** - Component testing with Jest
- **ESLint + Prettier** - Code quality and consistent formatting
- **Docker** - Containerized deployment with nginx

## Architecture

### Component Structure
```
src/
├── components/
│   ├── common/          # Shared UI components
│   ├── auth/            # Authentication components
│   ├── client/          # Client-specific components
│   └── public/          # Public-facing components
├── pages/               # Route components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── services/            # API service layers
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles and utilities
```

### Key Features

#### 🔐 Authentication & Authorization
- JWT-based authentication with automatic token refresh
- Role-based access control (client/therapist)
- Protected routes with automatic redirects
- Session timeout with user notification

#### 🎨 User Interface
- Responsive mobile-first design
- Accessible components (WCAG 2.1 AA compliance)
- Loading states and error boundaries
- Toast notifications for user feedback
- Smooth animations and transitions

#### 🔧 Developer Experience
- TypeScript for type safety
- Custom hooks for reusable logic
- Comprehensive test coverage
- Hot reloading in development
- Linting and formatting automation

#### 🚀 Production Ready
- Docker containerization with nginx
- Environment-based configuration
- Performance optimizations (lazy loading, memoization)
- Production build optimization
- Health checks and monitoring

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Docker and Docker Compose (for full-stack development)

### Development Setup
```bash
# Install dependencies
make frontend-install

# Start development server
make frontend-dev

# Or start full-stack development
make dev-full
```

### Available Commands
```bash
# Development
make frontend-dev              # Start dev server (localhost:3000)
make frontend-install          # Install dependencies
make frontend-build           # Production build

# Code Quality
make frontend-lint            # Run ESLint
make frontend-lint-fix        # Fix ESLint issues
make frontend-format          # Format with Prettier
make frontend-type-check      # TypeScript checking

# Testing
make frontend-test            # Run tests
make frontend-test --coverage # Run with coverage

# CI/CD
make frontend-ci             # Full CI pipeline
make ci-all                  # Backend + frontend CI
```

## Core Concepts

### State Management
- React Context for global state (auth, notifications)
- Custom hooks for component-level state
- Form validation with `useFormValidation` hook
- Async operations with `useAsync` hook

### API Integration
- Centralized API service layer in `/services`
- Automatic error handling and user feedback
- JWT token management
- Type-safe request/response handling

### Routing & Navigation
- Protected routes based on authentication status
- Role-based route access
- Automatic dashboard redirects
- 404 and error page handling

### Error Handling
- Global error boundary for React errors
- Toast notifications for user actions
- Form validation with real-time feedback
- Network error retry mechanisms

## Component Categories

### Common Components
Reusable UI components used throughout the application:

- `ErrorBoundary` - Catches and displays React errors
- `LoadingSpinner` - Consistent loading indicators
- `LoadingOverlay` - Full-screen loading states
- `Toast` - Success/error/warning notifications
- `ConfirmDialog` - User confirmation modals
- `Header` - Application navigation header
- `Layout` - Page layout wrapper

### Authentication Components
User authentication and authorization:

- `LoginForm` - User login with validation
- `RegisterForm` - User registration with role selection
- `ProtectedRoute` - Route access control

### Client Components
Client-specific functionality:

- `CreateProfileForm` - Client profile creation
- `EditProfileForm` - Client profile management

### Public Components
Public-facing features:

- `TherapistCard` - Therapist listing display
- `TherapistsPage` - Public therapist directory

## Custom Hooks

### Core Hooks
- `useAuth` - Authentication state and actions
- `useAsync` - Async operations with loading states
- `useFormValidation` - Form validation and state management
- `useSessionTimeout` - Automatic session management

### Performance Hooks
- `useDebounce` - Debounced function calls
- `useThrottle` - Throttled function calls
- `useFilteredData` - Memoized search/filtering
- `useVirtualScroll` - Virtual scrolling for large lists

## Styling System

### CSS Architecture
- CSS Modules for component-scoped styles
- CSS Variables for theming and consistency
- Utility classes for common patterns
- Responsive design with mobile-first approach

### Design System
```css
/* Color Palette */
--color-primary: #3b82f6      /* Primary blue */
--color-success: #10b981      /* Success green */
--color-warning: #f59e0b      /* Warning orange */
--color-error: #ef4444        /* Error red */

/* Typography */
--font-family: 'Inter', sans-serif
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem

/* Spacing */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
```

### Responsive Breakpoints
```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## Testing Strategy

### Testing Philosophy
- Test behavior, not implementation
- Comprehensive component testing
- Integration testing for user workflows
- Accessibility testing compliance

### Test Structure
```bash
# Component tests
src/components/**/*.test.tsx

# Page tests
src/pages/**/*.test.tsx

# Hook tests
src/hooks/**/*.test.ts

# Utility tests
src/utils/**/*.test.ts
```

### Testing Utilities
```typescript
// Test helpers for common scenarios
import { renderWithAuth, mockApiCall } from '../utils/testHelpers';

// Example component test
test('displays user profile information', async () => {
  mockApiCall('/api/client/profile/get', mockProfile);

  render(<ClientDashboard />, { wrapper: AuthProvider });

  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

## Performance Optimizations

### Code Splitting
- Lazy loading for route components
- Dynamic imports for large dependencies
- Bundle optimization with React.lazy

### Rendering Optimizations
- Memoization with React.memo and useMemo
- Debounced search and user input
- Virtual scrolling for large lists
- Optimized re-renders with useCallback

### Network Optimizations
- API response caching
- Image lazy loading
- Gzip compression in production
- CDN-ready static assets

## Accessibility Features

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Accessibility Utilities
- Skip links for keyboard users
- Focus management in modals
- Loading states with screen reader announcements
- Error messages with proper associations

## Environment Configuration

### Development
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

### Production
```bash
# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## Deployment

### Docker Development
```bash
# Full-stack development
make dev-full

# Frontend only
make dev-frontend-only
```

### Production Build
```bash
# Build for production
make frontend-build

# Docker production build
docker build -f frontend/Dockerfile .
```

### Docker Compose
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- Health checks and container monitoring
- Nginx reverse proxy configuration

## Troubleshooting

### Common Issues

#### "Cannot resolve module" errors
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
make frontend-install
```

#### TypeScript compilation errors
```bash
# Run type checking
make frontend-type-check

# Check for missing dependencies
npm ls --depth=0
```

#### API connection issues
- Verify backend is running on port 8080
- Check REACT_APP_API_URL environment variable
- Confirm CORS configuration in backend

#### Build failures
```bash
# Clean build directory
rm -rf frontend/build

# Run full CI pipeline
make frontend-ci
```

### Development Tips

1. **Hot Reloading**: Changes auto-reload in development mode
2. **Browser DevTools**: Use React Developer Tools extension
3. **Network Tab**: Monitor API calls and responses
4. **Console**: Check for warnings and errors
5. **TypeScript**: Leverage type checking for early error detection

## Browser Support

### Supported Browsers
- Chrome 90+ (primary target)
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills
- Automatic polyfills via Create React App
- ES6+ features supported
- CSS Grid and Flexbox support

## Performance Metrics

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 100
- Best Practices: 90+
- SEO: 90+

### Bundle Size Targets
- Initial bundle: <200KB gzipped
- Route chunks: <50KB gzipped
- Total JavaScript: <500KB gzipped

## Related Documentation

- [Backend API Reference](../api/README.md)
- [Development Setup](../development/setup.md)
- [Deployment Guide](../deployment/README.md)
- [Architecture Overview](../architecture/overview.md)

## Contributing

See the main [Contributing Guide](../development/contributing.md) for:
- Code standards and conventions
- Pull request process
- Testing requirements
- Documentation updates

---

**Frontend Version**: 1.0.0
**Last Updated**: $(date)
**React Version**: 18.3.1
**TypeScript Version**: 4.9.5