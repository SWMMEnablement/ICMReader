# Overview

This is a full-stack web application for processing and analyzing ICM InfoWorks PRN (simulation output) files. The application allows users to upload PRN files from hydraulic/hydrodynamic simulations, parse the data, perform unit conversions between SI and US customary units, and view detailed analysis results in tabular format with export capabilities.

The application serves as a specialized tool for civil engineers and water management professionals who work with Autodesk InfoWorks ICM software and need to process simulation results efficiently.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: Custom drag-and-drop interface with react-dropzone

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for multipart file uploads with memory storage
- **Data Validation**: Zod schemas for runtime type checking
- **Development**: Hot module replacement via Vite middleware integration

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

## Database Schema Design
- **Users Table**: Basic authentication with username/password
- **PRN Files Table**: Stores uploaded files with metadata, content, and parsed JSON data
- **Shared Schema**: Common types and validation schemas between frontend and backend

## API Architecture
- **File Upload Endpoint**: `/api/prn/upload` - Handles PRN file uploads and parsing
- **Unit Conversion Endpoint**: `/api/prn/convert` - Processes unit conversions with configurable settings
- **RESTful Design**: Standard HTTP methods with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses

## Unit Conversion System
- **Supported Conversions**: 
  - Flow: m³/s ↔ cfs (cubic feet per second)
  - Length: meters ↔ feet
- **Configurable Precision**: User-selectable decimal places (0-6)
- **Bidirectional**: Supports both SI-to-US and US-to-SI conversions

## PRN File Processing
- **Parser**: Custom text-based parser for InfoWorks ICM PRN format
- **Data Extraction**: Node data (depths, water levels, flooding status) and Link data (flows, velocities, capacity)
- **Mass Balance**: Rainfall, inflow, outflow, and continuity error calculations
- **Status Classification**: Automatic categorization (normal, warning, critical) based on thresholds

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connectivity
- **drizzle-orm & drizzle-kit**: Type-safe ORM and schema management
- **express**: Web application framework
- **multer**: Multipart form data handling for file uploads
- **connect-pg-simple**: PostgreSQL session store

## Frontend UI Dependencies
- **@radix-ui/***: Headless UI component primitives (30+ components)
- **@tanstack/react-query**: Server state management and caching
- **class-variance-authority**: Type-safe CSS class variants
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management and validation

## Development and Build Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements

## Validation and Type Safety
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle ORM and Zod schemas
- **@hookform/resolvers**: React Hook Form validation resolvers

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class composition
- **nanoid**: URL-safe unique ID generation
- **cmdk**: Command palette component