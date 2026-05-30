# Testing

## Testing split

This project prefers:

- integration tests for most new coverage
- e2e tests for common feature flows
- unit tests only for the most critical logic and shared behavior

## Commands

Run Vitest:

```bash
npm run test
```

Run Playwright e2e:

```bash
npm run e2e
```

Run Playwright in headed mode:

```bash
npm run e2e:headed
```

## Important rule

Do not run e2e while `npm run dev` is already running.

Playwright starts its own frontend server and mock API server. The config is set to fail if those ports are already in use.

## Testing philosophy

I want to test _"Can user see and do what is intended?"_, not implementation details.

## Integration tests

Integration tests run with Vitest, Testing Library, and MSW.

Useful files:

- `src/testing/setup.ts`
- `src/testing/test-utils.tsx`
- `src/testing/mocks/handlers/*`

Use `renderApp()` when the test needs providers, routing, or auth setup.

```tsx
await renderApp(<LoginPage />, {
  user: null,
  path: paths.auth.login.path,
  url: paths.auth.login.getHref('/users'),
})
```

## E2E tests

E2E tests live in `e2e/`.

Write them sparingly as they are "heavier"/"slower" than integration tests.

Current examples cover:

- login and logout
- user CRUD

## Unit tests

Keep unit tests focused.

Good unit test targets:

- shared data display behavior
- important form validation behavior
- small reusable helpers with real branching logic

## Simple rules

- Start with an integration test unless there is a good reason not to.
- Use e2e for the main user journeys.
- Add unit tests for high-value shared logic, not for every small function.

[← Permissions](./08_permissions.md)
