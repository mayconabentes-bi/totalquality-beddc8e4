# TotalQuality - Architecture Documentation

## System Overview

TotalQuality is a Quality Management System (QMS) SaaS platform designed to help companies manage processes, monitor indicators, and ensure ISO compliance.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                        │  │
│  │  - React Router (SPA)                                │  │
│  │  - TanStack Query (State Management)                 │  │
│  │  - Tailwind CSS + shadcn-ui                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                       │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Auth Service    │  │  PostgreSQL DB   │               │
│  │  - JWT Tokens    │  │  - RLS Policies  │               │
│  │  - User Mgmt     │  │  - Triggers      │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  REST API        │  │  Realtime        │               │
│  │  - Auto-generated│  │  - WebSockets    │               │
│  └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Layer
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **State Management**: TanStack Query 5.83.0
- **Form Management**: React Hook Form 7.61.1
- **Validation**: Zod 3.25.76

### UI Layer
- **CSS Framework**: Tailwind CSS 3.4.17
- **Component Library**: shadcn-ui (Radix UI based)
- **Icons**: Lucide React
- **Theming**: next-themes

### Backend Layer (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth (JWT)
- **API**: Auto-generated REST & GraphQL
- **Real-time**: WebSocket subscriptions
- **Storage**: Supabase Storage (planned)

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn-ui components (56 components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── Benefits.tsx        # Landing page benefits section
│   ├── CTA.tsx            # Call-to-action section
│   ├── Features.tsx       # Features showcase
│   ├── Footer.tsx         # Page footer
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Hero section
│   └── Modules.tsx        # Modules showcase
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Login/Signup
│   ├── Dashboard.tsx      # Main dashboard
│   └── NotFound.tsx       # 404 page
├── hooks/                 # Custom React hooks
├── integrations/
│   └── supabase/          # Supabase client config
├── lib/                   # Utility functions
└── test/                  # Test files
```

## Database Schema

### Current Tables

#### companies
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cnpj TEXT,
  phone TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Planned Tables (Not Implemented)

- `documents` - Document management
- `non_conformities` - Non-conformity tracking
- `audits` - Audit planning and execution
- `trainings` - Training management
- `processes` - Process mapping
- `indicators` - KPI tracking
- `users` - Multi-user support
- `action_plans` - Corrective/preventive actions
- `notifications` - User notifications

## Security Architecture

### Row Level Security (RLS)

All tables implement RLS policies:

```sql
-- Example: Companies table policies
CREATE POLICY "Users can view their own company" 
  ON companies FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company" 
  ON companies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" 
  ON companies FOR UPDATE 
  USING (auth.uid() = user_id);
```

### Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend calls Supabase Auth API
   ↓
3. Supabase validates credentials
   ↓
4. JWT token generated and returned
   ↓
5. Token stored in localStorage
   ↓
6. Token included in all API requests
   ↓
7. RLS policies enforce data access
```

## Application Flow

### Landing Page Flow
```
/ (Index) → Hero → Features → Benefits → Modules → CTA
```

### Authentication Flow
```
/auth → Login/Signup Toggle → Form Validation → Supabase Auth
  → Profile Creation → Dashboard Redirect
```

### Dashboard Flow
```
/dashboard → Auth Check → Load User Data → Display Stats/Modules
```

## Component Architecture

### Design Patterns

1. **Compound Components**: Modal dialogs, dropdown menus
2. **Render Props**: Form fields with validation
3. **Higher-Order Components**: Protected routes
4. **Custom Hooks**: useAuth, data fetching hooks

### State Management Strategy

- **Server State**: TanStack Query (cached API responses)
- **Form State**: React Hook Form
- **UI State**: React useState/useReducer
- **Global State**: Context API (minimal usage)

## API Integration

### Supabase Client Configuration

```typescript
// Auto-configured REST endpoints:
GET    /rest/v1/companies
POST   /rest/v1/companies
PATCH  /rest/v1/companies?id=eq.{id}
DELETE /rest/v1/companies?id=eq.{id}

GET    /rest/v1/profiles
POST   /rest/v1/profiles
PATCH  /rest/v1/profiles?id=eq.{id}
```

### Data Fetching Pattern

```typescript
// Using TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
});
```

## Module Architecture (Planned)

### Module Structure
Each module will follow this pattern:

```
modules/
└── [module-name]/
    ├── components/      # Module-specific components
    ├── hooks/          # Module-specific hooks
    ├── pages/          # Module pages
    ├── types/          # TypeScript types
    └── api/            # API calls
```

### Planned Modules

1. **Documents Module**
   - Document CRUD
   - Version control
   - Approval workflow
   - Distribution management

2. **Non-Conformities Module**
   - NC registration
   - Root cause analysis
   - Action plans
   - Follow-up tracking

3. **Audits Module**
   - Audit planning
   - Checklist management
   - Evidence collection
   - Report generation

4. **Indicators Module**
   - KPI definition
   - Real-time monitoring
   - Charts and graphs
   - Alerts and notifications

5. **Trainings Module**
   - Competency matrix
   - Training scheduling
   - Certificates
   - Evaluations

6. **Processes Module**
   - Process mapping
   - Flowcharts
   - SIPOC diagrams
   - Process indicators

## Development Workflow

### Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "vite build",            // Production build
  "lint": "eslint .",               // Run linter
  "preview": "vite preview",        // Preview build
  "test": "vitest run",             // Run tests
  "test:watch": "vitest"            // Watch mode
}
```

### Build Process

1. TypeScript compilation
2. Component bundling with Vite
3. CSS processing with Tailwind
4. Asset optimization
5. Tree-shaking unused code
6. Code splitting by route

## Performance Considerations

### Current Optimizations
- Vite for fast HMR (Hot Module Replacement)
- React Router for code splitting by route
- TanStack Query for request deduplication and caching

### Recommended Optimizations
- [ ] Implement lazy loading for routes
- [ ] Add service worker for offline support
- [ ] Optimize bundle size (currently not analyzed)
- [ ] Implement image optimization
- [ ] Add CDN for static assets
- [ ] Implement pagination for large data sets

## Testing Strategy

### Current State
- ❌ Minimal test coverage
- ✅ Vitest configured
- ✅ Testing Library available

### Recommended Approach
1. **Unit Tests**: Component logic and utilities
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Critical user flows
4. **API Tests**: Backend endpoints

## Deployment Architecture

### Current Setup
- Platform: Lovable.dev (development)
- Build: Manual or auto-build on push

### Recommended Production Setup

```
GitHub → CI/CD Pipeline → Build → Deploy
  ↓
  ├─→ Run Tests
  ├─→ Lint Code
  ├─→ Build App
  ├─→ Run Security Scans
  └─→ Deploy to Vercel/Netlify
```

### Environment Variables
```
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Scalability Considerations

### Current Limitations
- Single-tenant architecture (one company per signup)
- No multi-user support within companies
- No role-based permissions
- No data partitioning

### Scalability Path
1. Implement multi-user support
2. Add role-based access control (RBAC)
3. Implement data partitioning by company
4. Add database indexing for common queries
5. Implement caching layer (Redis)
6. Add queue system for async processing

## Monitoring & Observability

### Recommended Implementation
- **Error Tracking**: Sentry or similar
- **Analytics**: Google Analytics or Mixpanel
- **Performance**: Web Vitals monitoring
- **Logging**: Structured logging with log levels
- **Uptime**: Status page and monitoring

## Future Architecture Considerations

### Microservices Possibility
As the system grows, consider:
- Document service (file processing)
- Notification service (emails, SMS)
- Reporting service (PDF generation)
- Analytics service (data processing)

### Mobile Support
- Progressive Web App (PWA)
- React Native app
- API-first design enables mobile clients

## Conclusion

The architecture is well-founded with modern technologies and best practices. The current implementation provides a solid foundation for a Quality Management System, but requires significant development to implement all planned features.

**Strengths**:
- Modern, maintainable tech stack
- Security-first approach with RLS
- Scalable backend (Supabase)
- Professional UI/UX

**Areas for Growth**:
- Feature implementation
- Test coverage
- Documentation
- Performance optimization
- Production readiness

---

*Document Version*: 1.0  
*Last Updated*: January 31, 2026  
*Status*: Initial Development
