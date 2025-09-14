# Project Structure

```
thappy/
│
├── cmd/                           # Go backend entry points
│   └── api/
│       └── main.go                 # Backend API server entry point
│
├── internal/                       # Private Go backend code
│   ├── domain/                     # Core business logic & entities
│   │   ├── entity.go              # Domain entities
│   │   ├── repository.go          # Repository interfaces
│   │   └── service.go             # Service interfaces
│   │
│   ├── handler/                    # HTTP handlers (presentation layer)
│   │   ├── health.go              # Health check endpoints
│   │   ├── middleware.go          # HTTP middleware
│   │   └── routes.go              # Route definitions
│   │
│   ├── service/                    # Business logic implementation
│   │   └── [feature]_service.go   # Service implementations
│   │
│   ├── repository/                 # Data access layer
│   │   └── postgres/              # PostgreSQL implementations
│   │       └── [entity]_repo.go
│   │
│   └── infrastructure/            # External services & config
│       ├── config/
│       │   └── config.go          # Configuration management
│       ├── database/
│       │   └── postgres.go        # Database connection & setup
│       └── messaging/
│           └── rabbitmq.go        # RabbitMQ connection & setup
│
├── pkg/                           # Public Go packages (can be imported by external projects)
│   ├── logger/                    # Structured logging
│   └── validator/                 # Input validation helpers
│
├── migrations/                    # Database migrations
│   ├── 000001_init_schema.up.sql
│   └── 000001_init_schema.down.sql
│
├── test/                          # Go backend tests
│   ├── integration/              # Integration tests
│   └── fixtures/                 # Test data
│
├── scripts/                      # Utility scripts
│   ├── migrate.sh               # Database migration script
│   └── seed.sh                  # Database seeding script
│
├── docs/                        # Documentation
│   └── api/                     # API documentation
│
├── frontend/                    # React TypeScript frontend application
│   ├── public/                  # Static assets
│   │   ├── index.html          # Main HTML template
│   │   ├── favicon.ico         # Site icon
│   │   ├── manifest.json       # PWA manifest
│   │   └── robots.txt          # Search engine directives
│   │
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── auth/          # Authentication-related components
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── LoginForm.tsx
│   │   │   │
│   │   │   └── common/        # Shared UI components
│   │   │       ├── Header.tsx        # Main site header with navigation
│   │   │       ├── Layout.tsx        # Page layout wrapper
│   │   │       ├── ConfirmDialog.tsx # Modal confirmation dialogs
│   │   │       └── ErrorBoundary.tsx # Error handling wrapper
│   │   │
│   │   ├── pages/             # Page-level components
│   │   │   ├── HomePage.tsx           # Main landing page with hero & service cards
│   │   │   ├── NotFoundPage.tsx      # 404 error page
│   │   │   │
│   │   │   ├── auth/                 # Authentication pages
│   │   │   │   ├── LoginPage.tsx     # User login
│   │   │   │   └── RegisterPage.tsx  # User registration
│   │   │   │
│   │   │   ├── public/              # Public content pages
│   │   │   │   ├── TherapiesPage.tsx     # Therapy services listing
│   │   │   │   ├── TherapyDetailPage.tsx # Individual therapy details
│   │   │   │   ├── TopicsPage.tsx        # Educational articles
│   │   │   │   ├── HelpPage.tsx          # Contact & support (Croatian)
│   │   │   │   └── TherapistsPage.tsx    # Therapist search/listing
│   │   │   │
│   │   │   ├── client/              # Client dashboard area
│   │   │   │   └── ClientDashboard.tsx
│   │   │   │
│   │   │   └── therapist/           # Therapist dashboard area
│   │   │       └── TherapistDashboard.tsx
│   │   │
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.tsx       # User authentication state
│   │   │   └── NotificationContext.tsx # Toast notifications
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts           # Authentication logic
│   │   │   ├── useAsync.ts          # Async operation handling
│   │   │   └── useSessionTimeout.ts # Session management
│   │   │
│   │   ├── services/          # API service layer
│   │   │   ├── api.ts              # Base API configuration
│   │   │   ├── auth.ts             # Authentication API calls
│   │   │   └── therapists.ts       # Therapist-related API calls
│   │   │
│   │   ├── styles/            # CSS styling
│   │   │   ├── global-base.css     # Base HTML element styles
│   │   │   ├── variables.css       # CSS custom properties (colors, fonts, spacing)
│   │   │   ├── global.module.css   # CSS modules for reusable styles
│   │   │   ├── animations.css      # CSS animations and transitions
│   │   │   ├── responsive.css      # Responsive design utilities
│   │   │   └── accessibility.css   # Accessibility enhancements
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── validation.ts      # Form validation helpers
│   │   │   └── testHelpers.ts     # Development testing utilities
│   │   │
│   │   └── App.tsx           # Root React component with routing
│   │
│   ├── package.json          # Frontend dependencies and scripts
│   ├── package-lock.json     # Dependency lock file
│   ├── tsconfig.json         # TypeScript configuration
│   └── .env.local           # Frontend environment variables
│
├── .github/
│   └── workflows/              # GitHub Actions
│       └── ci.yml
│
├── docker-compose.yml          # Local development environment
├── Dockerfile                  # Container image definition
├── Makefile                   # Common tasks
├── go.mod                     # Go dependencies
├── go.sum                     # Dependency checksums
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── .golangci.yml             # Linter configuration
└── README.md                 # Project documentation
```

## Architecture Overview

This is a full-stack application with a **Go backend** providing REST APIs and a **React TypeScript frontend** for the user interface.

### Backend Architecture (Go)

#### Domain Layer (`/internal/domain`)
- Pure business logic
- Domain entities and value objects
- Repository and service interfaces
- No external dependencies

#### Application Layer (`/internal/service`)
- Implements domain service interfaces
- Orchestrates use cases
- Transaction management
- Business rule validation

#### Infrastructure Layer (`/internal/infrastructure`)
- External service integrations
- Database connections
- Message queue setup
- Configuration loading

#### Presentation Layer (`/internal/handler`)
- HTTP request/response handling
- Input validation and sanitization
- Error response formatting
- Authentication/authorization middleware

#### Repository Layer (`/internal/repository`)
- Data persistence logic
- Query building
- Data mapping between domain and database

### Frontend Architecture (React TypeScript)

#### Component Architecture
- **Pages**: Top-level route components that orchestrate the user interface
- **Components**: Reusable UI components organized by domain (auth, common)
- **Context**: React Context providers for global state management
- **Hooks**: Custom React hooks for shared logic and side effects

#### Design System
- **CSS Variables**: Centralized design tokens in `variables.css`
- **CSS Modules**: Component-scoped styles in `global.module.css`
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Accessibility**: WCAG 2.1 compliant components and interactions

#### Key Features
- **Authentication**: JWT-based auth with role-based access control (client/therapist)
- **Session Management**: Automatic timeout with warning dialogs
- **Error Handling**: Global error boundaries with user-friendly messaging
- **API Integration**: TypeScript-first API service layer with type safety

#### Styling Approach
- **Modern Design**: Brightline-inspired clean interface with Inter font
- **Color System**: Orange primary (`#f59e0b`) with semantic color tokens
- **Layout**: CSS Grid and Flexbox for responsive layouts
- **Typography**: Hierarchical font scales with proper line heights

## Key Principles

### Backend Principles
1. **Dependency Rule**: Dependencies point inward (handlers → service → domain)
2. **Interface Segregation**: Small, focused interfaces
3. **Dependency Injection**: Pass dependencies explicitly
4. **Testability**: Each layer can be tested independently
5. **No Circular Dependencies**: Clear, one-way dependency flow

### Frontend Principles
1. **Component Composition**: Build complex UIs from simple, reusable components
2. **Type Safety**: Leverage TypeScript for compile-time error detection
3. **Accessibility First**: Ensure all users can effectively use the interface
4. **Performance**: Optimize bundle size and runtime performance
5. **User Experience**: Intuitive navigation and clear visual hierarchy