# Thappy Project File Structure

## Overview
This document provides a complete file structure overview of the Thappy project, including both backend (Go) and frontend (React TypeScript) components.

## Project Root Structure

```
thappy/
├── backend/                      # Go backend application
├── frontend/                     # React frontend application
├── docs/                        # Project documentation
├── migrations/                  # Database migration files
├── test/                        # Test scripts and fixtures
├── docker-compose.yml           # Docker compose configuration
├── docker-compose.prod.yml      # Production Docker configuration
├── Dockerfile                   # API container definition
├── Makefile                     # Build and deployment commands
├── go.mod                       # Go module dependencies
├── go.sum                       # Go module checksums
├── README.md                    # Main project documentation
└── PROJECT_SETUP_REQUIREMENTS.md # Infrastructure requirements
```

## Backend Structure

### `/cmd` - Application Entrypoints
```
cmd/
└── api/
    └── main.go                  # Main API server entrypoint
```

### `/internal` - Private Application Code

#### Domain Layer
```
internal/domain/
├── client/                      # Client domain logic
│   ├── entity.go               # Client entity definitions
│   ├── entity_test.go          # Client entity tests
│   ├── repository.go           # Client repository interface
│   └── service.go              # Client service interface
├── therapist/                   # Therapist domain logic
│   ├── entity.go               # Therapist entity definitions
│   ├── entity_test.go          # Therapist entity tests
│   ├── repository.go           # Therapist repository interface
│   └── service.go              # Therapist service interface
└── user/                        # User domain logic
    ├── entity.go               # User entity definitions
    ├── entity_test.go          # User entity tests
    ├── repository.go           # User repository interface
    └── service.go              # User service interface
```

#### Handler Layer (HTTP Controllers)
```
internal/handler/
├── http/                        # HTTP utilities
│   ├── errors.go               # Error handling utilities
│   ├── middleware.go           # HTTP middleware
│   └── response.go             # Response utilities
├── user/                        # User-specific handlers
│   ├── dto.go                  # User DTOs
│   ├── errors.go               # User error definitions
│   └── handler.go              # User HTTP handlers
├── client_handler.go            # Client HTTP handlers
├── dto.go                       # Shared DTOs
├── errors.go                    # Shared error definitions
├── routes.go                    # Route definitions
├── therapist_handler.go         # Therapist HTTP handlers
├── user_handler.go              # Main user handler
└── user_handler_test.go         # User handler tests
```

#### Infrastructure Layer
```
internal/infrastructure/
├── config/                      # Configuration management
│   ├── config.go               # Configuration structures
│   └── service.go              # Configuration service
├── container/                   # Dependency injection
│   └── container.go            # DI container
├── database/                    # Database connections
│   └── postgres.go             # PostgreSQL connection
└── messaging/                   # Message queue
    └── rabbitmq.go             # RabbitMQ connection
```

#### Repository Layer (Data Access)
```
internal/repository/
├── client/
│   └── postgres/               # PostgreSQL client repository
│       ├── repository.go
│       └── repository_test.go
├── therapist/
│   └── postgres/               # PostgreSQL therapist repository
│       ├── repository.go
│       └── repository_test.go
└── user/
    └── postgres/               # PostgreSQL user repository
        ├── repository.go
        └── repository_test.go
```

#### Service Layer (Business Logic)
```
internal/service/
├── auth/                        # Authentication services
│   ├── token.go                # JWT token service
│   └── token_test.go           # Token service tests
├── client/                      # Client business logic
│   ├── client.go               # Client service implementation
│   └── client_test.go          # Client service tests
├── therapist/                   # Therapist business logic
│   ├── therapist.go            # Therapist service implementation
│   └── therapist_test.go       # Therapist service tests
└── user/                        # User business logic
    ├── user.go                 # User service implementation
    └── user_test.go            # User service tests
```

### Database Migrations
```
migrations/
├── 000001_create_users_table.up.sql
├── 000001_create_users_table.down.sql
├── 000002_add_user_roles_and_profiles.up.sql
└── 000002_add_user_roles_and_profiles.down.sql
```

## Frontend Structure

### `/public` - Static Assets
```
frontend/public/
├── favicon.ico                  # Browser favicon
├── index.html                   # HTML template
├── logo192.png                  # PWA icon (192x192)
├── logo512.png                  # PWA icon (512x512)
├── mainpage_drawing.png         # Main page illustration
├── manifest.json                # PWA manifest
├── playtime.png                 # Playtime illustration
└── robots.txt                   # Search engine rules
```

### `/src` - Source Code

#### Components
```
frontend/src/components/
├── auth/                        # Authentication components
│   ├── LoginForm.tsx           # Login form component
│   ├── ProtectedRoute.tsx      # Route protection component
│   └── RegisterForm.tsx        # Registration form component
├── client/                      # Client-specific components
│   ├── CreateProfileForm.tsx   # Profile creation form
│   └── EditProfileForm.tsx     # Profile editing form
├── common/                      # Shared components
│   ├── ConfirmDialog.tsx       # Confirmation dialog
│   ├── DashboardRedirect.tsx   # Dashboard redirection
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── ErrorMessage.tsx        # Error message display
│   ├── Header.tsx              # App header
│   ├── Layout.tsx              # Page layout wrapper
│   ├── LoadingOverlay.tsx      # Loading overlay
│   ├── LoadingSpinner.tsx      # Loading spinner
│   └── Toast.tsx               # Toast notifications
├── public/                      # Public page components
│   └── TherapistCard.tsx        # Therapist card display
├── therapist/                   # Therapist components
│   └── (therapist-specific components)
└── Footer.tsx                   # App footer component
```

#### Pages
```
frontend/src/pages/
├── auth/                        # Authentication pages
│   ├── LoginPage.tsx           # Login page
│   └── RegisterPage.tsx        # Registration page
├── client/                      # Client pages
│   └── ClientDashboard.tsx     # Client dashboard
├── public/                      # Public pages
│   ├── ArticleDetailPage.tsx   # Article detail view
│   ├── ArticlesPage.tsx        # Articles listing
│   ├── HelpPage.tsx            # Help/contact page
│   ├── TherapiesPage.tsx       # Therapies listing
│   ├── TherapistsPage.tsx      # Therapists listing
│   └── TherapyDetailPage.tsx   # Therapy detail view
├── therapist/                   # Therapist pages
│   └── TherapistDashboard.tsx  # Therapist dashboard
├── HomePage.tsx                 # Main landing page
└── NotFoundPage.tsx             # 404 error page
```

#### Context (State Management)
```
frontend/src/context/
├── AuthContext.tsx              # Authentication context
└── NotificationContext.tsx     # Notification context
```

#### Hooks (Custom React Hooks)
```
frontend/src/hooks/
├── useAsync.ts                  # Async operations hook
├── useAuth.ts                   # Authentication hook
├── useFormValidation.ts         # Form validation hook
└── useSessionTimeout.ts         # Session timeout hook
```

#### Services (API Integration)
```
frontend/src/services/
├── clientProfile.ts             # Client profile API
└── therapistDiscovery.ts        # Therapist discovery API
```

#### Styles
```
frontend/src/styles/
├── accessibility.css            # Accessibility styles
├── animations.css               # Animation definitions
├── article-content.css          # Article content styles
├── global-base.css              # Base global styles
├── global.module.css            # CSS modules
├── responsive.css               # Responsive styles
└── variables.css                # CSS variables
```

#### Types (TypeScript Definitions)
```
frontend/src/types/
└── api.ts                       # API type definitions
```

#### Utils (Utility Functions)
```
frontend/src/utils/
├── api.ts                       # API utilities
├── auth.ts                      # Auth utilities
├── constants.ts                 # App constants
├── errorHandler.ts              # Error handling
├── performance.ts               # Performance monitoring
└── testHelpers.ts               # Test utilities
```

### Configuration Files
```
frontend/
├── Dockerfile                   # Frontend container
├── nginx.conf                   # Nginx configuration
├── package.json                 # NPM dependencies
├── package-lock.json            # Locked dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Frontend documentation
```

## Documentation Structure

```
docs/
├── api/                         # API documentation
│   ├── README.md               # API overview
│   ├── database.md             # Database schema
│   ├── routes.json             # Route definitions (JSON)
│   └── routes.md               # Route documentation
├── architecture/                # Architecture docs
│   └── overview.md             # System architecture
├── deployment/                  # Deployment guides
│   ├── README.md               # Deployment overview
│   └── configuration.md        # Configuration guide
├── development/                 # Development guides
│   ├── setup.md                # Setup instructions
│   └── testing.md              # Testing guide
├── frontend/                    # Frontend docs
│   ├── README.md               # Frontend overview
│   ├── api-integration.md      # API integration guide
│   ├── development.md          # Development guide
│   ├── pages.md                # Pages documentation
│   └── recent-updates.md       # Recent changes
├── guides/                      # User guides
│   └── authentication.md       # Auth guide
└── README.md                    # Main documentation
```

## Test Structure

```
test/
├── curl/                        # cURL test scripts
│   ├── 01-register-users.sh    # User registration tests
│   ├── 02-login-users.sh       # Login tests
│   ├── 03-protected-endpoints.sh # Protected endpoint tests
│   ├── 04-error-scenarios.sh   # Error scenario tests
│   ├── 05-client-therapist-registration.sh
│   ├── 06-client-profile-flow.sh
│   ├── 07-therapist-profile-flow.sh
│   ├── run-all-tests.sh        # Run all tests
│   └── tokens.txt               # Test tokens
├── fixtures/                    # Test data fixtures
└── integration/                 # Integration tests
```

## Docker Configuration

```
.
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── Dockerfile                   # API container (root)
└── frontend/Dockerfile          # Frontend container
```

## Key Configuration Files

### Backend
- `go.mod` - Go module dependencies
- `go.sum` - Dependency checksums
- `Makefile` - Build automation

### Frontend
- `package.json` - NPM dependencies
- `tsconfig.json` - TypeScript configuration
- `nginx.conf` - Web server configuration

### Environment
- `.env` files - Environment variables (not in repository)
- `docker-compose.yml` - Container orchestration
- `migrations/` - Database schema evolution

## API Routes Structure

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

### Client Routes
- `POST /api/clients/profile` - Create client profile
- `GET /api/clients/profile` - Get client profile
- `PUT /api/clients/profile` - Update client profile
- `DELETE /api/clients/profile` - Delete client profile

### Therapist Routes
- `POST /api/therapists/profile` - Create therapist profile
- `GET /api/therapists/profile` - Get therapist profile
- `PUT /api/therapists/profile` - Update therapist profile
- `DELETE /api/therapists/profile` - Delete therapist profile
- `GET /api/therapists/discovery` - Search therapists

## Database Schema

### Core Tables
- `users` - User authentication and basic info
- `client_profiles` - Client-specific information
- `therapist_profiles` - Therapist qualifications
- `specializations` - Therapy specializations

## Development Workflow

1. **Backend Development**
   - Domain models in `/internal/domain`
   - Business logic in `/internal/service`
   - HTTP handlers in `/internal/handler`
   - Data access in `/internal/repository`

2. **Frontend Development**
   - Components in `/src/components`
   - Pages in `/src/pages`
   - API integration in `/src/services`
   - State management in `/src/context`

3. **Testing**
   - Unit tests alongside source files (`*_test.go`, `*.test.tsx`)
   - Integration tests in `/test/integration`
   - API tests in `/test/curl`

4. **Deployment**
   - Docker containers for all services
   - Environment-specific compose files
   - Database migrations for schema changes

## Notes

- The project follows Clean Architecture principles
- Backend uses dependency injection via container
- Frontend uses React with TypeScript
- All services are containerized with Docker
- Database migrations are managed with migrate tool
- Authentication uses JWT tokens
- The project supports multiple user roles (client, therapist, admin)