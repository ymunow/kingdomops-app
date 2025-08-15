# Kingdom Impact Training - Spiritual Gifts Assessment

## Overview

This is a full-stack web application for conducting spiritual gifts assessments. The system provides a 60-question Likert-scale survey that evaluates participants across 12 spiritual gift categories, calculates their top 3 gifts, and provides detailed results with biblical context and ministry recommendations. The application includes user authentication, assessment administration, results visualization, and administrative dashboards for tracking participation and outcomes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Styling**: TailwindCSS with custom spiritual theme colors (spiritual-blue, warm-gold, sage-green, etc.)
- **Component System**: Radix UI primitives with shadcn/ui components for consistent design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful endpoints with rate limiting and error handling middleware
- **Development**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon serverless platform
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Database Structure**:
  - Users table with role-based access (ADMIN/PARTICIPANT)
  - Assessment versions for different questionnaire iterations
  - Questions table with gift key mappings
  - Responses and answers for tracking participant submissions
  - Results table for storing calculated spiritual gift scores

### Authentication and Authorization
- **Authentication Method**: JWT tokens with secure httpOnly cookie storage
- **Password Security**: bcrypt hashing with salt rounds
- **Role-Based Access**: ADMIN and PARTICIPANT roles with route-level protection
- **Rate Limiting**: Express rate limiting for authentication endpoints and assessment submissions
- **Session Management**: Stateless JWT approach with token validation middleware

### Assessment System Design
- **Gift Categories**: 12 spiritual gifts mapped to enum values (LEADERSHIP_ORG, TEACHING, WISDOM_INSIGHT, etc.)
- **Question Distribution**: 5 questions per gift category for balanced assessment
- **Scoring Algorithm**: Likert scale (1-5) aggregation with top 3 gift identification
- **Multi-Step Flow**: Questions → Age Groups → Ministry Interests → Results
- **Progress Tracking**: Real-time progress indication and answer persistence

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Nodemailer**: Email service integration for sending assessment results to participants
- **SMTP Configuration**: Configurable email provider settings (Gmail default) for transactional emails

### Development and Deployment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Build Process**: ESBuild for server bundling and Vite for client builds
- **Environment Configuration**: Environment variables for database connections, JWT secrets, and SMTP settings

### UI and Design Dependencies
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework with custom design tokens
- **Class Variance Authority**: Type-safe component variant management

### Data and Business Logic
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Performant form handling with minimal re-renders
- **TanStack React Query**: Server state synchronization and caching layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect