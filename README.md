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

### Layer Responsibilities

- `src/app` contains app wiring: router, route guards, layouts, and top-level providers
- `src/components` contains reusable UI primitives and shared composed components
- `src/config` contains env handling, constants, paths, and query keys
- `src/features` contains domain features such as auth and future insurance workflows
- `src/lib` contains library setup such as the API client and React Query client
- `src/testing` contains test setup, mock server handlers, and test utilities

### Feature Architecture

Each feature should be organized around a single domain concern and own most of the code needed to deliver that concern.

Expected feature shape:

```text
src/features/some-feature/
├── api/         # API requests and React Query hooks
├── components/  # Feature-specific UI
├── hooks/       # Feature-specific hooks
├── types/       # Feature-specific types and schemas
└── utils/       # Feature-specific helpers
```

The intent is that feature code stays colocated. Shared code only moves out of a feature when it is truly reusable across the app.

Form and API contracts follow a consistent naming pattern:

- Form types use `[Entity]FormValues`, for example `LoginFormValues` or `ClientFormValues`
- Action payloads use `[Entity][Action]Action`, for example `LoginAction` or `ClientCreateAction`

Feature `utils/` contains feature-local business logic and helper functions that do not belong in UI, hooks, or API files. Builders and mapping logic are one common use of this folder:

- `DomainType -> FormValues`
- `FormValues -> Action`
- `DomainType -> Action` when a separate form mapping step is not needed

### Example: Auth Feature

The current `auth` feature is a good small example of the intended structure:

```text
src/features/auth/
├── api/
│   └── login.ts
├── components/
│   ├── login-form.tsx
│   └── login-form.test.tsx
└── utils/
    └── login.ts
```

How the pieces work together:

- `utils/login.ts` defines the login form schema with Zod and exports the feature form values type
- `api/login.ts` owns the login request and wraps it in a TanStack Query mutation hook
- `components/login-form.tsx` renders the feature UI and submits validated form data through `useLogin`
- `components/login-form.test.tsx` tests the feature behavior from the user perspective

This keeps validation, API interaction, UI, and tests close to the auth domain instead of scattering them across the repo.

### Request Flow Inside A Feature

For a typical feature endpoint, the intended flow is:

1. Define the domain types, form values, and action payload types for the feature.
2. Use feature builders in `utils/` to map between `DomainType`, `FormValues`, and `Action` shapes.
3. Implement the fetcher in `api/` using the shared API client from `src/lib`.
4. Wrap the fetcher in a React Query hook or mutation.
5. Consume that hook from a feature component.
6. Compose the feature into a route or page from `src/app`.

For auth, that flow currently looks like this:

1. `src/features/auth/utils/login.ts` defines the login schema and feature form values type.
2. Feature builders map form values into the action body sent to the API when needed.
3. `src/features/auth/api/login.ts` sends `POST /auth/login`.
4. `useLogin` updates cached auth state and redirects on success.
5. `src/features/auth/components/login-form.tsx` submits the form.
6. `src/app/routes/auth/login-page.tsx` mounts the feature inside the app router.

## Routing And Auth

- Routing is handled with React Router
- Protected routes are enforced inside the `<AuthGuard />`
- The app currently includes a login flow and a protected home route

## Testing

- End-to-end tests live in `./e2e`
- Unit tests live next to the files they cover, as `*.test.ts` or `*.test.tsx`
- Integration tests live under `src/app`, also using the `*.test.tsx` naming pattern

### Unit and integration tests

```bash
npm run test
```

### End-to-end tests

```bash
npm run e2e
```

Playwright starts the frontend and mock API automatically for e2e runs.

## Mock API

The local API runs through an Express server wired to MSW handlers and mock data. This keeps frontend development and testing isolated from any real backend dependency.

## Tooling notes

- React Compiler is enabled in the Vite build pipeline
- ESLint and Prettier are configured for code quality and consistency
- Absolute imports are available through the `@/` alias family

## Status

The repo is in development and is meant to serve as a personal portfolio project, if you want to use it for your own projects, do so at your own discretion
