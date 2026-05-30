# Insurance Admin Dashboard

Personal Portfolio - Internal insurance operations dashboard built with React, TypeScript, and Vite.

## Overview

This project is an internal admin application for insurance workflows.

It is structured around a feature-based architecture inspired by Bulletproof React and is set up for local development with a mocked API.

The current codebase includes authentication, protected routing, shared UI primitives, testing utilities, and the foundation for building out insurance management flows such as clients, policy holders, policies, hospitals, and damage reports.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Vitest
- Playwright
- MSW
- Express mock server

## Getting Started

### Prerequisites

- Node.js (v24 recommended)
- npm

### Environment Variables

Create a `.env` file in the project root:

```bash
VITE_APP_API_URL=http://localhost:8080/api
VITE_APP_APP_URL=http://localhost:5173
VITE_APP_MOCK_API_PORT=8080
```

```bash
# Check dependencies before installing
npm audit

# If you see anything other than:
found 0 vulnerabilities

# run:
npm audit fix

# Only then install the dependencies.
npm install

# Start the app
npm run dev

# This starts both:
# - the Vite development server
# - the local mock API server
```

## Available Scripts

```bash
# Start the frontend and mock API server
npm run dev

# Start the frontend only
npm run dev:client

# Start the mock API server only
npm run mock-server

# Type-check and build the app for production
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint

# Run ESLint with automatic fixes
npm run lint:fix

# Run TypeScript checks without emitting files
npm run typecheck

# Run Vitest (Unit and Integration)
npm run test

# Run Playwright end-to-end tests
npm run e2e

# Run Playwright in headed mode - use this for debugging e2e
npm run e2e:headed

# Check formatting with Prettier
npm run format

# Apply formatting with Prettier
npm run format:fix
```

## Project Structure

```text
src/
├── app/         # Application shell, routes, providers
├── components/  # Shared UI and reusable components
├── config/      # App configuration and constants
├── docs/        # Detailed docs, many of them linked here, in README.md
├── features/    # Feature modules
├── hooks/       # Shared hooks
├── lib/         # Library setup and shared integrations
├── testing/     # Test utilities, mocks, and setup
├── types/       # Shared TypeScript types
└── utils/       # Shared utilities
```

## Architecture Notes

- The repo follows a feature-based architecture inspired by Bulletproof React
- Shared building blocks live in `src/components`, `src/lib`, `src/hooks`, `src/utils`, and `src/types`
- Business features live in `src/features` and should stay self-contained
- The application layer in `src/app` composes features into routes, providers, and page-level flows
- Data flow is intentionally one-way: shared modules -> features -> app
- Features should not import from other features directly
- Server state is managed with TanStack Query
- Forms use React Hook Form with Zod validation
- Local development and tests use mocked API handlers

### Routing And Auth

Routing is handled with React Router, protected routes go through `AuthGuard`, and the current user is cached in TanStack Query.

See more here: [01 Auth](./docs/01_auth.md)

### Shared Components

Generic building blocks live in `src/components`. Feature-specific UI should stay inside the feature until it is clearly reusable.

See more here: [02 Shared Components](./docs/02_shared_components.md)

### Feature Architecture

Each feature owns its own UI, API calls, types, and helpers. App routes should stay thin and compose feature entry components.

See more here: [03 Features](./docs/03_features.md)

### Server Communication

Server communication is built around TanStack Query hooks on top of the shared Axios client and feature-owned query keys.

See more here: [04 Server Communication](./docs/04_server_communication.md)

### Lists And Tables

List pages are built from `RemoteData`, `RemoteDataWithFilters`, `DataView`, `Table`, and `List`. Table columns should be built with `tableColumnBuilder()`.

See more here: [05 Lists And Tables](./docs/05_lists_and_tables.md)

### Forms

Forms use React Hook Form with Zod, and shared field components from `src/components/form`.

See more here: [06 Forms](./docs/06_forms.md)

### Dialogs And Alerts

Create and edit flows use dialogs. Destructive actions use confirmation alerts.

See more here: [07 Dialogs And Alerts](./docs/07_dialogs_and_alerts.md)

### Permissions

Permissions are built centrally with `allow()` rules and checked in UI with `can()`.

See more here: [08 Permissions](./docs/08_permissions.md)

## Testing

Most tests should be integration tests. E2E covers common feature flows. Unit tests are reserved for the most critical logic and shared behavior.

See more here: [09 Testing](./docs/09_testing.md)

## Mock API

The local API runs through an Express server wired to MSW handlers and mock data. This keeps frontend development and testing isolated from any real backend dependency.

## Tooling notes

- React Compiler is enabled in the Vite build pipeline
- ESLint and Prettier are configured for code quality and consistency
- Absolute imports are available through the `@/` alias family
- Husky runs Git hooks before commits and pushes
- To skip Git hooks for a one-off commit: `git commit -m "..." --no-verify`
- To skip Git hooks for a one-off push: `git push --no-verify`

## Status

The repo is in development and is meant to serve as a personal portfolio project, if you want to use it for your own projects, do so at your own discretion
