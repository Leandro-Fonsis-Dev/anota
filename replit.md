# Replit Project Documentation

## Overview

This is a full-stack TypeScript application built with React frontend and Express.js backend. The application is a note-taking system with user authentication, allowing users to create, manage, and track tasks/notes with completion status. The app features a modern Material Design-inspired UI using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth using express-session
- **Password Security**: bcryptjs for password hashing
- **Validation**: Zod schemas shared between frontend and backend

### Development Setup
- **Development Server**: Concurrent frontend (Vite) and backend (tsx) servers
- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Build Process**: Vite for frontend build, esbuild for backend bundling

## Key Components

### Database Schema
Located in `shared/schema.ts`:
- **Users table**: id, name, email, password
- **Notes table**: id, userId, title, createdDate, completedDate, status
- **Relations**: One-to-many relationship between users and notes
- **Status types**: "A Fazer" (To Do) or "Concluída" (Completed)

### Authentication System
- Session-based authentication with express-session
- Password hashing with bcryptjs
- Protected routes using auth middleware
- Registration and login endpoints

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Frontend Pages
- **Login Page**: User authentication with floating label inputs
- **Register Page**: User registration with password confirmation
- **Dashboard Page**: Main app interface for note management
- **Not Found Page**: 404 error handling

### UI Components
- Modern floating label inputs for forms
- Material Design-inspired button variants
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Dark mode support through CSS variables

## Data Flow

1. **Authentication Flow**:
   - User registers/logs in → Backend validates → Session created → Redirect to dashboard

2. **Note Management Flow**:
   - Dashboard loads → Fetch user notes → Display in filtered view
   - User creates/edits note → Form validation → API call → Optimistic updates
   - Note status changes trigger UI updates and completion date tracking

3. **State Management**:
   - TanStack Query handles server state caching and synchronization
   - React Hook Form manages form state and validation
   - Session state maintained server-side with express-session

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Via `@neondatabase/serverless` driver
- **ORM**: Drizzle ORM for type-safe database operations

### UI Dependencies
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **shadcn/ui**: Pre-built component library

### Development Dependencies
- **TypeScript**: Static typing
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for backend
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Build Process
- Frontend: `vite build` → Static assets in `dist/public`
- Backend: `esbuild` → Bundled server in `dist/index.js`
- Database: `drizzle-kit push` for schema migrations

### Environment Setup
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (defaults provided for development)
- **NODE_ENV**: Environment flag (development/production)

### Production Considerations
- Static file serving from `dist/public`
- Session security with secure cookies in HTTPS environments
- Database connection pooling via Neon serverless
- Error handling and logging middleware

### Replit-Specific Features
- Runtime error overlay for development
- Cartographer plugin for Replit integration
- Development banner script for external access
- File system security restrictions