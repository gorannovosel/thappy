# Frontend Pages Documentation

Documentation for all pages in the Thappy frontend application.

## Overview

The frontend consists of public pages, authentication pages, and protected dashboard pages. This document focuses on the main public-facing pages that provide information and services to visitors.

## Page Structure

All pages follow a consistent structure using:
- CSS Modules for scoped styling
- Shared design system variables
- Responsive grid layouts
- Accessible components

## Public Pages

### HomePage (`/`)

**Purpose**: Main landing page introducing users to Thappy services

**Features**:
- Hero section with platform introduction
- Three main service cards linking to key features
- Call-to-action buttons for registration and login
- Footer with site navigation and contact information

**Components Used**:
- Layout wrapper
- Responsive grid system
- Card components
- Button styles from global.module.css

### TherapiesPage (`/therapies`)

**Purpose**: Display available therapy types for children

**Features**:
- Overview of 6 therapy types:
  - Logoped (Speech Therapy)
  - Radna terapija (Occupational Therapy)
  - Edukacijsko-rehabilitacijski rad
  - Socijalna terapija (Social Therapy)
  - Psihološka podrška (Psychology)
  - Fizioterapija (Physical Therapy)
- Cards with therapy descriptions and icons
- Links to detailed therapy pages
- Call-to-action for professional guidance

**Key Code Features**:
```typescript
interface TherapyType {
  id: string;
  title: string;
  description: string;
  icon: string;
}
```

### TherapyDetailPage (`/therapies/:therapyId`)

**Purpose**: Detailed information about specific therapy types

**Features**:
- Breadcrumb navigation back to therapies listing
- Detailed therapy information and benefits
- List of available therapists for that specialty
- Integration with existing therapist discovery API
- Professional assessment call-to-action

**Dynamic Routing**: Uses React Router parameters to display therapy-specific content

**API Integration**: Connects to existing `therapistDiscoveryApi` service

### TopicsPage (`/topics`)

**Purpose**: Educational articles and resources

**Features**:
- Search functionality for articles
- Category filtering (Speech Development, Occupational Therapy, etc.)
- Featured articles highlighting
- Article cards with metadata (read time, publish date)
- Newsletter subscription form
- Sample articles covering various therapy topics

**State Management**:
```typescript
const [selectedCategory, setSelectedCategory] = useState('All Topics');
const [searchTerm, setSearchTerm] = useState('');
```

**Article Structure**:
```typescript
interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedDate: string;
  featured?: boolean;
}
```

### HelpPage (`/help`)

**Purpose**: Contact and support page for families needing guidance

**Features**:
- Contact information in Croatian (phone, email, address)
- Contact form for help requests
- Emergency contact information
- Quick action links to other services
- Form submission handling with success state

**Contact Form Fields**:
- Name and email (required)
- Phone number (optional)
- Child's age selection
- Area of concern selection
- Detailed message (required)

**Localization**: Contains Croatian text as requested:
- "Zatražite pomoć" (Request help)
- "Ne znate što vam treba?" (Don't know what you need?)

## Navigation Updates

### Header Component Changes

Added new navigation links:
- **Therapies** (`/therapies`) - Browse therapy types
- **Topics** (`/topics`) - Educational articles
- **Ask for help** (`/help`) - Get professional guidance
- **Search** (`/therapists`) - Find therapists (existing)

Navigation maintains existing authentication dropdown and responsive behavior.

## Routing Configuration

### App.tsx Updates

New routes added to the public section:

```typescript
<Route path="/therapies" element={<TherapiesPage />} />
<Route path="/therapies/:therapyId" element={<TherapyDetailPage />} />
<Route path="/topics" element={<TopicsPage />} />
<Route path="/help" element={<HelpPage />} />
```

All routes are public and don't require authentication.

## Styling Approach

### Design System Usage

All pages use the established design system:

- **Colors**: Primary blue (#2563eb), secondary grays
- **Typography**: Font size and weight variables
- **Spacing**: Consistent spacing units (xs, sm, md, lg, xl)
- **Components**: Card, button, and form styles

### Responsive Design

Pages implement responsive layouts using:
- CSS Grid with `repeat(auto-fit, minmax())` for flexibility
- Mobile-first approach
- Consistent breakpoints from variables.css

### Example Grid Usage:
```css
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
gap: var(--spacing-xl)
```

## Future Enhancements

### Content Management

Currently uses hardcoded content. Future improvements could include:
- CMS integration for articles and therapy information
- Dynamic therapist filtering by specialization
- User-generated content and reviews

### Internationalization

Pages contain some Croatian content. Consider:
- Full localization support
- Language switching functionality
- Content translation management

### SEO Optimization

Potential improvements:
- Meta tags and descriptions
- Structured data for therapy information
- Sitemap generation

## Testing Considerations

Pages should be tested for:
- Responsive behavior across device sizes
- Navigation between pages
- Form submission handling
- Loading states for dynamic content
- Accessibility compliance

## Performance

Optimization features implemented:
- CSS Modules for efficient styling
- React lazy loading (can be added for large pages)
- Minimal external dependencies
- Optimized images (icons are emoji for simplicity)

---

**Last Updated**: January 2024
**Related Documentation**:
- [Frontend Development Guide](development.md)
- [API Integration](api-integration.md)
- [Component Architecture](README.md)