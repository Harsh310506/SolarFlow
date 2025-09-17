# Overview

This is a comprehensive Solar Business Management System built for a solar company to manage clients, government approvals, inventory, finance, and agent activities. The application serves as a centralized platform to streamline the entire solar project lifecycle from initial client contact through government approval processes to final installation and billing.

The system is designed to handle role-based access control with admin and agent roles, where admins have full system access while agents have limited access to their assigned clients and tasks. The application focuses on the government approval workflow which is critical for solar installations, providing a step-by-step pipeline tracking system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables and CSS custom properties
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based authentication system with localStorage persistence

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Authentication**: Simple credential-based authentication (suitable for internal company use)
- **API Design**: RESTful endpoints organized by feature modules (clients, approvals, tasks, etc.)
- **Session Management**: Header-based user identification for API requests

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with full TypeScript support and type-safe queries
- **Schema Structure**: 
  - User management with role-based access (admin/agent)
  - Client management with agent assignment
  - Government approval workflow tracking with step-by-step pipeline
  - Task and reminder system
  - Inventory management with stock tracking
  - Financial management (invoices, payments)
- **File Storage**: References to document URLs (prepared for future integration with cloud storage)

## Authentication and Authorization
- **Authentication Method**: Email/password with simple credential verification
- **Authorization**: Role-based access control with two primary roles:
  - Admin: Full system access including agent management and system configuration
  - Agent: Limited access to assigned clients and related tasks
- **Session Persistence**: Client-side localStorage with user context management
- **Route Protection**: Component-based route guards with role checking

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI Framework**: React with extensive Radix UI component ecosystem
- **State Management**: TanStack Query for efficient data fetching and caching
- **Validation**: Zod for runtime type validation and schema validation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **CSS Framework**: Tailwind CSS with PostCSS for processing
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Development Experience**: Replit-specific plugins for enhanced development workflow

### Key Integrations
- **PostgreSQL Connection**: Direct connection with SSL requirements for production security
- **Font Loading**: Google Fonts integration for typography (DM Sans, Architects Daughter, Fira Code, Geist Mono)
- **Form Handling**: React Hook Form with Zod resolvers for comprehensive form management
- **Date Handling**: date-fns library for consistent date formatting and manipulation

The architecture emphasizes type safety throughout the stack with shared TypeScript types between frontend and backend, ensuring consistent data contracts and reducing runtime errors.