# Fault Report Management System

## Overview

This is a comprehensive fault reporting system designed for enterprise workflow management. The application allows users to submit fault reports, track their status through various stages (pending, approved, assigned, rejected), and manage related processes like job card issuance and procurement requests. Built with React on the frontend and Express.js on the backend, it features a modern UI using shadcn/ui components and follows enterprise design patterns for data-heavy applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with structured error handling
- **File Upload**: Multer for handling file attachments with validation
- **Development**: Hot reloading and runtime error overlay for development

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle migrations and schema definitions
- **Storage Interface**: Abstract storage layer with memory storage for development
- **File Storage**: Local file system with organized upload directory structure

### Design System
- **Color Palette**: Professional blue primary colors with status-specific colors (green for approved, orange for pending, etc.)
- **Typography**: Inter font family with consistent weight and size hierarchy
- **Layout**: Card-based design with consistent spacing using Tailwind units
- **Theme Support**: Light and dark mode with CSS custom properties
- **Components**: Comprehensive component library following Material Design and Fluent Design principles

### Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **User Management**: Basic user authentication with username/password
- **Security**: Input validation using Zod schemas

### Workflow Management
- **Status Tracking**: Four-stage workflow (pending → approved → assigned → rejected)
- **Job Card System**: Integration for issuing job cards to workshop planners
- **Procurement Requests**: Support for procurement with priority levels (24hrs, 72hrs, miscellaneous)
- **File Attachments**: Support for images, PDFs, and documents with validation

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, TanStack Query for data fetching
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach

### Backend Services
- **Database**: PostgreSQL via Neon serverless (configured through DATABASE_URL)
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL session store for user sessions

### Development Tools
- **Build System**: Vite with TypeScript support and development optimizations
- **Code Quality**: ESBuild for production builds, TypeScript for type checking
- **Development Experience**: Replit integration with cartographer and runtime error overlay

### File Handling
- **Upload Processing**: Multer with custom storage configuration
- **File Validation**: MIME type and extension validation for security
- **Supported Formats**: Images (JPEG, PNG, GIF), documents (PDF, DOC, DOCX, TXT, XLS, XLSX)