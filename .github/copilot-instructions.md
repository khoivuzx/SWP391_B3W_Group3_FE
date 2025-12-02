# Copilot Instructions for FPT Event Management System

## Project Overview
- **Framework**: Vite + React 18.2 + TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite with HMR
- **Storage**: Supabase Storage for images

## Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, Modal, Card)
│   ├── events/         # Event-specific components (EventCard)
│   ├── tickets/        # Ticket-specific components (TicketCard)
│   └── Layout.tsx      # Main layout wrapper
├── pages/              # Route pages organized by feature
│   ├── auth/           # Authentication pages (Login)
│   ├── events/         # Event pages (Events, EventDetail, EventCreate, EventEdit)
│   ├── tickets/        # Ticket pages (MyTickets, TicketDetail)
│   ├── admin/          # Admin pages (CheckIn, SeatManagement, Reports)
│   ├── guest/          # Guest pages (GuestLanding)
│   └── Dashboard.tsx   # Main dashboard
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state
├── services/           # API service layer (mock implementations)
│   ├── authService.ts  # Authentication API calls
│   ├── eventService.ts # Event CRUD operations
│   └── ticketService.ts # Ticket/registration operations
├── utils/              # Utility functions
│   ├── dateUtils.ts    # Date formatting (Vietnamese locale)
│   ├── validators.ts   # Input validation functions
│   └── qrCodeUtils.ts  # QR code generation/parsing
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts # Typed localStorage hook
│   └── useDebounce.ts  # Debounce hook
├── constants/          # Application constants
│   └── index.ts        # Routes, event types, status, validation rules
├── types/              # TypeScript type definitions
│   └── event.ts        # Event, Registration, Seat interfaces
├── data/               # Mock data (for development)
│   └── mockData.ts     # Mock events, registrations, seats
└── App.tsx             # Root component with router
```

## Code Style Guidelines

### TypeScript
- Use TypeScript strict mode
- Define interfaces for all props and data structures
- Use type inference where obvious, explicit types for public APIs
- Avoid `any` - use `unknown` if type is truly unknown

### React Patterns
- Use functional components with hooks
- Use React Router for navigation (not Next.js routing)
- Prefer named exports from index files (barrel exports)
- Use Context API for global state (AuthContext)
- Keep components focused and single-purpose

### Component Organization
- Export components from feature folders using index.ts
- Use common components for reusable UI (Button, Input, Modal, Card)
- Keep feature-specific logic in feature components
- Separate presentational from container components

### Imports
- Use barrel exports: `import { EventCard } from '@/components/events'`
- Group imports: external → components → utils → types
- Use relative paths for src files

### Styling
- Use Tailwind utility classes
- Follow consistent color scheme (blue primary, gray neutrals)
- Use responsive classes (md:, lg:) for layouts
- Maintain Vietnamese language in UI text

### State Management
- Use useState for local component state
- Use Context API for global state (AuthContext)
- Use custom hooks (useLocalStorage, useDebounce) for reusable logic
- Keep state as close to usage as possible

## Naming Conventions
- **Components**: PascalCase (EventCard.tsx)
- **Hooks**: camelCase with 'use' prefix (useLocalStorage.ts)
- **Services**: camelCase with Service suffix (eventService.ts)
- **Utils**: camelCase (dateUtils.ts)
- **Constants**: SCREAMING_SNAKE_CASE (EVENT_TYPES)
- **Types**: PascalCase (Event, Registration)

## Feature Implementation

### Adding New Features
1. Identify feature category (events, tickets, admin, etc.)
2. Create components in appropriate feature folder
3. Add service functions for API calls (mock for now)
4. Define types if needed
5. Add constants if needed
6. Create page in appropriate pages subfolder
7. Update routing in App.tsx
8. Export from index.ts

### API Integration (Future)
- All service functions are currently mocked
- Replace Promise.resolve() with actual API calls
- Use axios or fetch for HTTP requests
- Update service layer without changing component code

### Form Validation
- Use validators from utils/validators.ts
- Show errors inline with Input component's error prop
- Validate on submit, not on every keystroke

### Date Handling
- Use date-fns with Vietnamese locale
- Format dates consistently using dateUtils.formatDate()
- Store dates as ISO strings

## Testing Approach
- Mock data in src/data/mockData.ts
- Test components with mock services
- Validate forms with validators
- Check responsive layouts at multiple breakpoints

## Common Tasks

### Creating a New Page
1. Create component in appropriate pages subfolder
2. Add to feature's index.ts export
3. Add route in App.tsx
4. Use Layout wrapper if authenticated page

### Adding a New Component
1. Decide if common or feature-specific
2. Create in appropriate components subfolder
3. Define props interface
4. Export from feature's index.ts
5. Import using barrel export

### Adding Form Validation
1. Check if validator exists in utils/validators.ts
2. If not, add new validator function
3. Use validator in form submit handler
4. Display errors via Input component's error prop

## Important Notes
- This is a **Vite React** project, NOT Next.js
- Use `import.meta.env` for environment variables (not process.env)
- Dev server runs on port 5173 by default
- Use Vietnamese language for all user-facing text
- Mock data is in mockData.ts - real API integration pending
- Supabase Storage configured for image uploads (bucket: user-uploads)

## Dependencies
- react-router-dom: Client-side routing
- date-fns: Date manipulation
- lucide-react: Icon library
- recharts: Charts for reports
- qrcode.react: QR code generation
- @supabase/supabase-js: Cloud storage

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
