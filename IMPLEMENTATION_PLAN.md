# Frontend Implementation Plan

## Overview
Create a React TypeScript frontend for the existing Go backend API with dual user system (client/therapist), JWT authentication, and complete profile management.

## Architecture Decisions
- **React 18** with TypeScript for type safety
- **React Router v6** for client-side routing
- **Context API** for global state management
- **Fetch API** for HTTP requests (no external HTTP library)
- **CSS Modules** for styling (no external UI library)
- **Minimal dependencies** approach
- **Test-Driven Development** with React Testing Library and Jest
- **Automated testing** required for all new features

## Backend API Summary
- Base URL: `http://localhost:8080`
- JWT Authentication with Bearer tokens
- Roles: `client` and `therapist`
- 20+ endpoints covering auth, profiles, and public discovery

## Test-Driven Development Workflow

**MANDATORY**: All new features must follow this TDD cycle:

1. **Red** - Write failing tests first
2. **Green** - Write minimal code to pass tests
3. **Refactor** - Improve code while keeping tests green
4. **Repeat** - Continue for each small increment

**Test Requirements**:
- **Unit Tests**: All components, hooks, utilities
- **Integration Tests**: User flows, API integration
- **Coverage**: Minimum 80% test coverage
- **Types**: All tests fully typed with TypeScript

**Test Structure**:
```
src/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
├── utils/
│   ├── utility.ts
│   └── utility.test.ts
└── __tests__/
    ├── integration/
    └── fixtures/
```

---

## Phase 1: Foundation Setup
**Goal**: Set up React project with proper structure and basic routing
**Success Criteria**: App runs, routing works, project structure established
**Status**: Complete

### Tasks:
- [x] Create React TypeScript app in `/frontend` directory
- [x] Install minimal dependencies (react-router-dom, @types/node)
- [x] Set up project folder structure
- [x] Create basic routing with React Router
- [x] Set up CSS Modules configuration
- [x] Create base layout components
- [x] Add TypeScript interfaces for API responses
- [x] Set up development scripts

### Key Files to Create:
```
frontend/
├── src/
│   ├── components/common/
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── auth/
│   ├── utils/
│   │   ├── api.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── api.ts
│   ├── styles/
│   │   ├── global.module.css
│   │   └── variables.css
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

### Tests:
- [x] App renders without errors
- [x] Routing navigation works
- [x] CSS modules apply correctly
- [x] TypeScript compilation passes

---

## Phase 2: Authentication System
**Goal**: Complete user authentication flow with JWT handling
**Success Criteria**: Users can register, login, logout, and tokens are managed properly
**Status**: Complete

### Backend Endpoints to Integrate:
- `POST /api/register-with-role` - Registration with role selection
- `POST /api/login` - User authentication
- `GET /api/profile` - Get current user profile

### Tasks:
- [x] Create authentication context with useContext
- [x] Implement JWT token storage (localStorage with security considerations)
- [x] Build registration form with role selection (client/therapist)
- [x] Build login form with validation
- [x] Create logout functionality
- [x] Add protected route wrapper component
- [x] Implement automatic token validation
- [x] Add token expiry handling
- [x] Create authentication hooks (useAuth, useUser)

### Key Components:
- [x] `AuthContext.tsx` - Context provider with auth state
- [x] `AuthProvider.tsx` - Wrapper component
- [x] `LoginForm.tsx` - Login page with form validation
- [x] `RegisterForm.tsx` - Registration with role selection
- [x] `ProtectedRoute.tsx` - Route protection wrapper
- [x] `useAuth.ts` - Custom hook for auth operations

### API Integration:
```typescript
// Auth API functions
const authAPI = {
  register: (email: string, password: string, role: 'client' | 'therapist') => Promise<AuthResponse>,
  login: (email: string, password: string) => Promise<AuthResponse>,
  getProfile: (token: string) => Promise<UserProfile>,
  updateProfile: (token: string, data: UpdateProfileData) => Promise<UserProfile>
}
```

### Tests:
- [x] Registration creates user and returns JWT
- [x] Login with valid credentials succeeds
- [x] Invalid credentials show proper errors
- [x] Protected routes redirect unauthenticated users
- [x] Token expiry triggers logout

---

## Phase 3: User Profile Management
**Goal**: Complete CRUD operations for both client and therapist profiles
**Success Criteria**: Users can create, view, edit, and delete their profiles
**Status**: Foundation Complete - Dashboards and Routing Implemented

### ✅ Completed Foundation Tasks:
- [x] Role-based dashboard pages (ClientDashboard, TherapistDashboard)
- [x] Protected routing with role enforcement
- [x] Dashboard redirect logic based on user role
- [x] Updated App.tsx with complete route structure
- [x] Test-driven development workflow established
- [x] Frontend build integration with existing Makefile

### 🚧 Next: Profile CRUD Implementation

### Backend Endpoints to Integrate:

#### Client Profile (Role: client)
- `POST /api/client/profile` - Create client profile
- `GET /api/client/profile/get` - Get client profile
- `PUT /api/client/profile/personal-info` - Update name
- `PUT /api/client/profile/contact-info` - Update contact details
- `PUT /api/client/profile/date-of-birth` - Set date of birth
- `DELETE /api/client/profile/delete` - Delete profile

#### Therapist Profile (Role: therapist)
- `POST /api/therapist/profile` - Create therapist profile
- `GET /api/therapist/profile/get` - Get therapist profile
- `PUT /api/therapist/profile/personal-info` - Update name
- `PUT /api/therapist/profile/contact-info` - Update contact
- `PUT /api/therapist/profile/bio` - Update bio
- `PUT /api/therapist/profile/license` - Update license number
- `PUT /api/therapist/profile/specializations` - Update all specializations
- `POST /api/therapist/profile/specialization/add` - Add specialization
- `DELETE /api/therapist/profile/specialization/remove` - Remove specialization
- `PUT /api/therapist/profile/accepting-clients` - Toggle accepting status
- `DELETE /api/therapist/profile/delete` - Delete profile

### Tasks:
- [ ] Create profile context for state management
- [ ] Build client profile components and forms
- [ ] Build therapist profile components and forms
- [ ] Implement profile creation wizard/onboarding
- [ ] Add profile editing with sectioned forms
- [ ] Create profile deletion with confirmation
- [ ] Add form validation for all profile fields
- [ ] Implement optimistic updates
- [ ] Handle profile not found states

### Key Components:

#### Client Components:
- [ ] `ClientDashboard.tsx` - Main client dashboard
- [ ] `ClientProfile.tsx` - View client profile
- [ ] `ClientProfileForm.tsx` - Edit profile form
- [ ] `PersonalInfoForm.tsx` - Name editing
- [ ] `ContactInfoForm.tsx` - Phone and emergency contact
- [ ] `DateOfBirthForm.tsx` - DOB selection

#### Therapist Components:
- [ ] `TherapistDashboard.tsx` - Main therapist dashboard
- [ ] `TherapistProfile.tsx` - View therapist profile
- [ ] `TherapistProfileForm.tsx` - Edit profile form
- [ ] `BioEditor.tsx` - Bio text editing
- [ ] `LicenseForm.tsx` - License number editing
- [ ] `SpecializationsManager.tsx` - Add/remove specializations
- [ ] `AcceptingClientsToggle.tsx` - Toggle accepting status

### Form Validation:
```typescript
const validationRules = {
  client: {
    first_name: 'required|min:2',
    last_name: 'required|min:2',
    phone: 'required|phone',
    emergency_contact: 'required|phone',
    date_of_birth: 'optional|date'
  },
  therapist: {
    first_name: 'required|min:2',
    last_name: 'required|min:2',
    license_number: 'required|unique',
    phone: 'required|phone',
    bio: 'required|min:50|max:1000',
    specializations: 'array|min:1'
  }
}
```

### Tests:
- [ ] Profile creation completes successfully
- [ ] Profile editing updates correctly
- [ ] Form validation prevents invalid submissions
- [ ] Profile deletion works with confirmation
- [ ] Role-based profile access enforced
- [ ] Specialization management works for therapists

---

## Phase 4: Public Features & Discovery
**Goal**: Implement public therapist discovery and viewing
**Success Criteria**: Public users can browse and view therapist profiles
**Status**: Not Started

### Backend Endpoints to Integrate:
- `GET /api/therapists/accepting` - Get all accepting therapists

### Tasks:
- [ ] Create public therapist listing page
- [ ] Build therapist card components
- [ ] Add filtering and search functionality
- [ ] Create therapist detail view
- [ ] Implement contact/inquiry features
- [ ] Add responsive design for mobile
- [ ] Optimize for SEO (basic meta tags)

### Key Components:
- [ ] `TherapistDirectory.tsx` - Main listing page
- [ ] `TherapistCard.tsx` - Individual therapist card
- [ ] `TherapistDetail.tsx` - Detailed therapist view
- [ ] `SearchFilter.tsx` - Search and filter controls
- [ ] `SpecializationFilter.tsx` - Filter by specializations
- [ ] `ContactTherapist.tsx` - Contact form/information

### Features:
- [ ] List all accepting therapists
- [ ] Search by name or specialization
- [ ] Filter by specialization categories
- [ ] Sort by name, experience, etc.
- [ ] Responsive card grid layout
- [ ] Loading states and error handling

### Tests:
- [ ] Therapist listing loads correctly
- [ ] Search and filtering work
- [ ] Therapist details display properly
- [ ] Contact information is accessible
- [ ] Mobile responsive design works

---

## Phase 5: Polish & Integration
**Goal**: Complete the application with error handling, loading states, and production readiness
**Success Criteria**: Production-ready app with proper error handling and user experience
**Status**: Not Started

### Tasks:
- [ ] Implement comprehensive error handling
- [ ] Add loading states throughout app
- [ ] Create proper form validation with user feedback
- [ ] Add success/error notifications
- [ ] Implement responsive design
- [ ] Add accessibility features (a11y)
- [ ] Optimize performance (lazy loading, memoization)
- [ ] Add basic animations and transitions
- [ ] Create 404 and error pages
- [ ] Add logout confirmation
- [ ] Implement session timeout handling

### Key Components:
- [ ] `ErrorBoundary.tsx` - Catch React errors
- [ ] `Toast.tsx` - Success/error notifications
- [ ] `ConfirmDialog.tsx` - Confirmation dialogs
- [ ] `LoadingOverlay.tsx` - Full-page loading
- [ ] `EmptyState.tsx` - Empty data states

### Error Handling Strategy:
```typescript
const errorHandling = {
  network: 'Show retry option',
  validation: 'Show field-specific errors',
  auth: 'Redirect to login',
  forbidden: 'Show permission error',
  notFound: 'Show 404 page',
  server: 'Show generic error with support contact'
}
```

### Tests:
- [ ] Error states display properly
- [ ] Loading states work consistently
- [ ] Form validation provides clear feedback
- [ ] Responsive design works on all devices
- [ ] Accessibility standards met
- [ ] Performance is acceptable

---

## Phase 6: Build System & Deployment
**Goal**: Integrate frontend with existing Makefile and prepare for deployment
**Success Criteria**: Frontend builds, integrates with backend, and runs via Makefile
**Status**: Not Started

### Makefile Integration:
Add to existing `/Makefile`:

```makefile
## frontend-install: Install frontend dependencies
.PHONY: frontend-install
frontend-install:
	cd frontend && npm install

## frontend-dev: Start frontend development server
.PHONY: frontend-dev
frontend-dev:
	cd frontend && npm start

## frontend-build: Build frontend for production
.PHONY: frontend-build
frontend-build:
	cd frontend && npm run build

## frontend-test: Run frontend tests
.PHONY: frontend-test
frontend-test:
	cd frontend && npm test -- --coverage --watchAll=false

## dev-full: Start both backend and frontend
.PHONY: dev-full
dev-full:
	make dev-detached
	sleep 5
	make frontend-dev

## build-all: Build both backend and frontend
.PHONY: build-all
build-all: build frontend-build

## clean-all: Clean both backend and frontend
.PHONY: clean-all
clean-all: clean
	cd frontend && rm -rf node_modules build
```

### Tasks:
- [ ] Create production build configuration
- [ ] Set up environment variables for different stages
- [ ] Configure proxy for development API calls
- [ ] Add frontend linting and formatting
- [ ] Create Docker configuration for frontend
- [ ] Update main Makefile with frontend commands
- [ ] Add combined development workflow
- [ ] Create production deployment guide

### Environment Configuration:
```env
# .env.development
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

### Tests:
- [ ] Production build completes successfully
- [ ] Environment variables work correctly
- [ ] Makefile commands execute properly
- [ ] Frontend integrates with backend
- [ ] Both services start together with `make dev-full`

---

## File Structure Summary

```
thappy/
├── frontend/                     # New React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Shared components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── client/          # Client-specific components
│   │   │   └── therapist/       # Therapist-specific components
│   │   ├── pages/
│   │   │   ├── auth/            # Login/register pages
│   │   │   ├── client/          # Client pages
│   │   │   ├── therapist/       # Therapist pages
│   │   │   └── public/          # Public pages
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ProfileContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useProfile.ts
│   │   ├── utils/
│   │   │   ├── api.ts           # API utilities
│   │   │   ├── auth.ts          # Auth utilities
│   │   │   └── constants.ts
│   │   ├── types/
│   │   │   ├── api.ts           # API response types
│   │   │   ├── user.ts          # User types
│   │   │   └── profile.ts       # Profile types
│   │   ├── styles/
│   │   │   ├── global.module.css
│   │   │   └── variables.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   └── tsconfig.json
├── cmd/api/main.go              # Existing backend
├── internal/                    # Existing backend code
├── docs/                        # Existing documentation
├── Makefile                     # Updated with frontend commands
└── IMPLEMENTATION_PLAN.md       # This file
```

## Dependencies Summary

### Core Dependencies:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
```

### Development Dependencies:
```json
{
  "devDependencies": {
    "@types/node": "^18.0.0",
    "react-scripts": "5.0.1"
  }
}
```

## Success Metrics

### Phase Completion Criteria:
1. **Phase 1**: App runs, routing works, structure established
2. **Phase 2**: Full authentication flow working
3. **Phase 3**: Complete profile CRUD for both roles
4. **Phase 4**: Public therapist discovery functional
5. **Phase 5**: Production-ready with proper UX
6. **Phase 6**: Integrated build system and deployment ready

### Final Success Criteria:
- [ ] All backend API endpoints integrated
- [ ] Role-based access control working
- [ ] Responsive design on desktop and mobile
- [ ] Proper error handling and loading states
- [ ] Form validation and user feedback
- [ ] Production build and deployment ready
- [ ] Makefile commands for full-stack development
- [ ] Code follows TypeScript and React best practices

## Timeline Estimate
- **Phase 1**: 1-2 days (Setup and foundation)
- **Phase 2**: 2-3 days (Authentication system)
- **Phase 3**: 3-4 days (Profile management)
- **Phase 4**: 1-2 days (Public features)
- **Phase 5**: 2-3 days (Polish and UX)
- **Phase 6**: 1 day (Build integration)

**Total**: 10-15 days for complete implementation

---

## Next Steps
1. Review this plan and adjust priorities
2. Start with Phase 1: Foundation Setup
3. Work incrementally, completing one phase before moving to next
4. Test integration with backend after each phase
5. Update this document as implementation progresses

Remove this file when all phases are complete.