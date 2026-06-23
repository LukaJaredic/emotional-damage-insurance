# Observability

## Sentry

Sentry is configured in `src/app/app.tsx` with `@sentry/react`.

Required environment variables:

```bash
VITE_APP_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
VITE_APP_SENTRY_ENABLED=true
```

`VITE_APP_SENTRY_ENABLED` is parsed as a boolean in `src/config/env.ts`. Use the strings `true` or `false`; do not rely on JavaScript boolean coercion for env values.

When Sentry is enabled, `VITE_APP_SENTRY_DSN` is required. When it is disabled, the DSN may be omitted.

## Environments

Sentry events use `environment: import.meta.env.MODE`.

Common values:

- `development` when running `npm run dev`
- `production` for production builds

This means local development errors can be sent to Sentry when `VITE_APP_SENTRY_ENABLED=true`, but they remain separated from production by environment.

## Error Boundaries

`src/components/errors/error-boundary.tsx` reports caught React render errors through `captureReactException(error, info)`.

Use the shared `ErrorBoundary` component for route and app-level boundaries so React component stack details are included in Sentry events.

## API Errors

`src/lib/api.ts` reports failed Axios responses through `captureException(error)` in the shared response interceptor.

Non-GET failures also show a toast to the user. All failed responses are still rethrown so TanStack Query and callers can handle them normally.

## Privacy

The Sentry client disables user information and request body collection in `src/app/app.tsx`:

```ts
dataCollection: {
  userInfo: false,
  httpBodies: [],
}
```

Keep this conservative default unless there is a clear product need to collect more diagnostic context.

[← Testing](./09_testing.md)
