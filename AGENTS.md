# Agent Guide

This repository is a React and Vite insurance administration dashboard. Its architecture is inspired by [Bulletproof React](https://github.com/alan2207/bulletproof-react/), but this project has its own conventions.

## Before Changing Code

1. Read `README.md` for setup and project structure.
2. Read the relevant guide in `docs/`.
3. Inspect nearby code and tests before choosing a pattern.
4. Keep changes small and consistent with the existing feature.

## Commands

```bash
nvm use
npm ci
npm run dev
npm run test
npm run tsc
npm run lint
npm run format
```

Use `npm run lint:with-cycle-check` before pushing. It is slower than normal lint because it checks the full dependency graph.

Do not run `npm run e2e` while `npm run dev` is running. Playwright starts its own app and mock API servers.

## Project Structure

```text
src/
├── api/         # API code shared across features or app-level code
├── app/         # Routes, providers, and application composition
├── components/  # Shared UI, form, layout, and data components
├── config/      # Environment, paths, pagination, and shared query keys
├── features/    # Feature-owned API, UI, types, and utilities
├── hooks/       # Shared React hooks
├── lib/         # Configured third-party libraries
├── testing/     # Test setup, helpers, MSW handlers, and mock data
├── types/       # Shared domain types
└── utils/       # Shared utilities
```

Implemented domain areas are users, policy holders, and policies. User roles are `admin`, `employee`, and `customer`.

## Architecture Rules

- Data flows from shared modules to features to the app: `shared -> features -> app`.
- Features must not import from other features.
- Keep feature-only code inside its feature.
- Move API code to `src/api` when app-level code, shared UI, or more than one feature needs it.
- Keep app route files thin. They should read route params and render feature entry components.
- Put shared domain objects in `src/types`; put form and feature-only types inside the feature.
- Avoid barrel imports inside foundational modules when a direct file import prevents a dependency cycle.

The policy-holder list API is the main ownership example. It lives in `src/api/policy-holders` because both policy holders and policies use it. Its shared query keys live in `src/config/query-keys.ts`.

## TypeScript And Style

- TypeScript strict mode is enabled.
- Files and folders use kebab-case.
- Components use PascalCase; functions and variables use camelCase.
- Use configured aliases such as `@/`, `@app/`, `@features/`, and `@testing/` for source imports.
- Import React APIs directly, for example `import { useState, type ReactNode } from 'react'`.
- Project-owned code should not use `React.useState`, `React.ReactNode`, or `import * as React`.
- Files under `src/components/ui/shadcn` may keep upstream shadcn/Radix import patterns.
- Let ESLint and Prettier enforce formatting.

## Server State

- Use the shared Axios client from `src/lib/api.ts`.
- Use TanStack Query for server state.
- Keep fetchers separate from query and mutation hooks.
- Keep feature-only query keys in the feature's `utils` folder.
- Keep shared query keys in `src/config/query-keys.ts`.
- Keep pagination defaults in `src/config/pagination.ts`.
- Invalidate related query keys after successful mutations.
- Non-GET API failures already show a toast through the shared Axios interceptor.

## Components And Forms

- Put generic components in `src/components` only when they are reusable.
- Shared components must not import feature code.
- Forms use React Hook Form and Zod.
- Use shared fields from `src/components/form` instead of rebuilding labels and errors.
- Forms must not submit generated `BaseEntity` fields.
- Pass stable imported hooks to `RemoteData`, `RemoteDataWithFilters`, and `RemoteSelect`. Do not pass inline hook functions.
- Build table columns with `tableColumnBuilder()`.

## Permissions

- Define role permissions in `src/utils/permissions.ts`.
- Use `allowPage()` and `canAccess()` for routes and navigation.
- Use `allow()` and `can()` for resource actions, records, and fields.
- Page names use singular resources, for example `user:master-page` and `policy-holder:detail-page`.
- Frontend permissions improve the UI; API handlers must still enforce authorization.

## Testing

- Prefer integration tests for feature behavior.
- Use unit tests for important utilities and shared logic.
- Use E2E tests for a small number of critical journeys.
- Test what the user sees and does, not internal hook calls.
- Use `renderApp()` when providers, routing, auth, permissions, or React Query are needed.
- Prefer MSW server overrides over mocking API hooks or shared form controls.
- Use existing test helpers before adding new interaction helpers.
- Global test setup resets the DOM, mocks, mock database, handlers, cookies, and query client.

## Mock API

Development and tests use MSW handlers. Persisted models include `BaseEntity` audit fields:

```ts
type BaseEntity = {
  id: string
  createdAt: number
  lastEditedAt: number
  createdBy: User['id']
  lastEditedBy: User['id']
}
```

The mock backend generates these fields. Forms should not expose them, and detail pages should render them with `<Audit />`.

## Git Hooks

- Pre-commit runs normal ESLint and a Prettier check.
- Pre-push runs ESLint with dependency-cycle checks, TypeScript, and Vitest.
- Do not bypass hooks unless explicitly requested. If a hook cannot run, report why and run the available checks directly.

See `docs/` for focused explanations of auth, features, API ownership, lists, forms, permissions, testing, and Git workflow.
