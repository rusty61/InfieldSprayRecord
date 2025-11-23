# Infield Spray Record Web App

## Overview

The Infield Spray Record Web App is a mobile-first agricultural compliance application designed for capturing spray mix and application records in the field. The application enables farm owners, managers, operators, and contractors to create compliant records with GPS location data, weather conditions, tank mix details, and paddock information. Built with a focus on offline capability and field usability, the app supports audit trails, reusable templates, and QA compliance requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with the following pages:
- Dashboard (home page with stats and recent applications)
- New Application (form for creating spray records)
- Records (view and filter past applications)
- Paddocks (manage paddock boundaries and metadata)
- Settings (user preferences)

**State Management**: 
- TanStack Query (React Query) for server state management with disabled auto-refetch
- React Context API for theme management (light/dark mode)
- Local component state for form inputs and UI interactions

**UI Component Library**: shadcn/ui components based on Radix UI primitives with Tailwind CSS styling. Uses the "New York" style variant with custom theming for agricultural/industrial applications.

**Design System**: Material Design 3 adapted for field use with:
- Inter font family for all typography
- Touch-optimized 44px minimum touch targets
- Mobile-first responsive layouts (px-4 on mobile, max-w-6xl on desktop)
- Custom color system using CSS variables for theming
- Spacing primitives in 8px increments (2, 4, 6, 8 Tailwind units)

**Key Design Principles**:
- Field-first efficiency for outdoor, one-handed mobile use
- Offline transparency with visual sync status indicators
- Clear data hierarchy separating editable forms from calculated totals
- Compliance confidence through visual distinction of audit data

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API with JSON payloads. Current endpoints include:
- `GET /api/paddocks` - Fetch all paddocks or filter by GPS proximity
- `GET /api/paddocks/:id` - Fetch single paddock by ID
- `POST /api/paddocks` - Create new paddock with boundary validation
- `PATCH /api/paddocks/:id` - Update paddock details
- `DELETE /api/paddocks/:id` - Remove paddock (soft delete expected)

**Development vs Production**:
- Development: Vite middleware integration with HMR support
- Production: Serves pre-built static assets from dist/public directory
- Both modes use the same Express app with different static file handling

**Request Handling**: Custom logging middleware captures request duration and response details for API routes.

### Data Storage

**ORM**: Drizzle ORM with type-safe query building and Zod schema validation integration.

**Database**: PostgreSQL (Neon serverless) accessed via WebSocket connection pooling.

**Schema Design**:

1. **Users Table**: Basic authentication with username/password (hashed passwords expected in implementation)

2. **Paddocks Table**: 
   - Stores farm field/paddock information with GPS boundaries
   - `boundaryCoordinates` as JSONB array of lat/lng points (minimum 3 required)
   - `centerLatitude` and `centerLongitude` for proximity searches
   - `area` in hectares for spray rate calculations
   - Validation enforces coordinate bounds (-90 to 90 lat, -180 to 180 lng)

**Migration Strategy**: Drizzle Kit configured to output migrations to `/migrations` directory with schema source in `/shared/schema.ts`.

**Data Validation**: 
- Server-side validation using Drizzle-Zod schemas
- Coordinate sanitization prevents invalid GPS data
- Type-safe inserts and updates through generated schemas

### Authentication & Authorization

**Current State**: User schema exists but authentication is not yet implemented. The design anticipates session-based authentication with Express sessions stored in PostgreSQL (connect-pg-simple dependency present).

**Expected Implementation**: 
- Session-based auth with secure cookies
- User roles for operators vs. managers
- Audit trail tracking who created/modified records

### External Dependencies

**GPS/Location Services**: HTML5 Geolocation API accessed via `navigator.geolocation` with high accuracy mode enabled (10-second timeout, no cached positions).

**Weather Data Integration**: Planned integration with Blynk weather station webhook for capturing:
- Wind speed and direction
- Temperature
- Humidity
- Timestamp snapshot stored with each application record

**Third-Party Libraries**:
- **Neon Database**: Serverless PostgreSQL with WebSocket connections
- **Radix UI**: Unstyled accessible component primitives
- **TanStack Query**: Data fetching and cache management
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: CSS variant management
- **Tailwind CSS**: Utility-first styling framework
- **Wouter**: Lightweight routing (2kb alternative to React Router)

**Font Delivery**: Google Fonts CDN for Inter font family (400, 500, 600 weights with tabular numerals).

**Build Tools**:
- Vite with React plugin for frontend builds
- esbuild for production server bundling
- Replit-specific plugins for development (cartographer, dev-banner, runtime error overlay)

**Development Dependencies**:
- TypeScript for type safety across client/server/shared code
- PostCSS with Tailwind and Autoprefixer
- Path aliases configured for clean imports (@/, @shared/, @assets/)