

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Full-stack TypeScript app with an Express server (server/) and a React client (client/) built via Vite. Shared types and validation live in shared/.
- In development, the Express server mounts a Vite middleware dev server with HMR. In production, the prebuilt client is served from dist/public and the server runs from a bundled Node entry.

Commands
- Install dependencies
  - npm install
- Start development server (Express + Vite middleware)
  - npm run dev
  - Serves both API and client on http://localhost:${PORT:-5000} (defaults to 5000)
- Type-check
  - npm run check
- Build client and server
  - npm run build
  - Outputs client to dist/public and bundles server to dist/index.js (ESM)
- Run production build
  - npm start
  - Set PORT if you need a non-default port (PowerShell example): $env:PORT=8080; npm start
- Database (optional, if you wire up Drizzle/Neon)
  - npm run db:push (drizzle-kit push)

Notes
- No test or lint scripts are defined in package.json at this time.
- The scripts set NODE_ENV for dev/start; Express defaults to "development" if not set. Production behavior relies on serving prebuilt assets via dist/public.

High-level architecture
- Server (Express)
  - Entry: server/index.ts
    - Global JSON/urlencoded parsers
    - Request timing/logging for /api routes
    - On start: registerRoutes(app) → returns http.Server
    - Dev: setupVite(app, server) attaches Vite middleware with HMR
    - Prod: serveStatic(app) serves dist/public with index.html fallback
    - Listens on PORT (default 5000), host 0.0.0.0
  - Dev tooling integration: server/vite.ts
    - Imports Vite config from vite.config.ts, runs in middlewareMode with HMR bound to the http.Server
    - Rewrites client index.html to bust cache on main.tsx during dev
    - serveStatic() validates dist/public exists, then serves it and falls back to index.html
  - Routes: server/routes.ts
    - Fault reports REST API under /api/fault-reports with pagination, filtering, sorting, CRUD
    - File uploads via multer to ./uploads with name sanitization, size/type validation; static serving under /uploads
    - Actions:
      - POST /api/fault-reports/:id/issue-job-card → sets status=approved
      - POST /api/fault-reports/:id/procurement-request → sets status=assigned with a required priority
      - POST/DELETE attachments to add/remove files on a report (with access verification)
    - Secure file serving under /api/files/:filename (+ /info) with path traversal checks, MIME headers
    - Analytics endpoints under /api/analytics/* (dashboard, distributions, trends)
  - Storage: server/storage.ts
    - In-memory implementation (MemStorage) of IStorage for users and fault reports
    - Provides filtering, sorting, pagination; attachment bookkeeping and access verification
    - Computes analytics (status distribution, priority and department breakdowns, simple trend data)
- Client (React + Vite)
  - Vite config: vite.config.ts
    - Root at client
    - Aliases:
      - @ → client/src
      - @shared → shared
      - @assets → attached_assets
    - Builds to dist/public
  - Entry: client/src/main.tsx → mounts App
  - App shell: client/src/App.tsx
    - QueryClientProvider (TanStack Query) via client/src/lib/queryClient.ts
    - Maintains a simple view state (dashboard, analytics, detail, job-card, procurement)
    - Uses components for reports table, forms, detail views, analytics dashboard, theme toggle
  - Data layer: client/src/lib/api.ts
    - ApiClient calling /api/* endpoints; returns typed results used by React Query
  - UI: client/src/components/* (Shadcn/Radix UI primitives and app-specific components)
- Shared (Types/validation)
  - shared/schema.ts (Drizzle ORM table definitions and Zod schemas)
    - FaultReport and User types, insert/patch schemas, status enum

Paths, outputs, and environment
- Build outputs
  - Client: dist/public
  - Server: dist/index.js (ESM)
- Uploads directory
  - ./uploads created at runtime; served under /uploads and linked to report attachments
- Environment
  - PORT controls both API and client server port (default 5000)
  - Express env toggles dev/prod code paths (Vite middleware vs. static serving)

Conventions for future changes
- Client/server shared types should be added to shared/schema.ts and imported via the @shared alias.
- When adding new API routes, update server/routes.ts and, if consumed by the client, add matching methods to client/src/lib/api.ts and wire them via React Query.
