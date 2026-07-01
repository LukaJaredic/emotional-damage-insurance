# Auth

## Main files

- `src/app/providers/app-provider.tsx` mounts the React Query provider and `UserProvider`.
- `src/app/providers/user-provider.tsx` loads the current user with `useMe()`.
- `src/app/auth-guard.tsx` protects routes and handles redirects.
- `src/features/auth/api/login.ts` handles login - since `useLogin()` is used only in `features/auth`.
- `src/api/auth/get-me.ts` handles `useMe()` - since the current user is needed by app-level providers.
- `src/api/auth/logout.ts` handles `useLogout()` - since logout is exposed through app-level user context.

## How auth works

1. The app starts inside `AppProvider`.
2. `UserProvider` calls `useMe()` to load the current user.
3. `AuthGuard` checks whether the current route requires a user.
4. If the user is missing, the app redirects to `/auth/login?redirectTo=...`.
5. If the route passes a `page`, `AuthGuard` checks `canAccess(page)`.
6. If the user cannot access that page, the app redirects to the not-found page.
7. The login form submits to `POST /auth/login`.
8. On success, the logged-in user is written into React Query.
9. The app redirects back to the requested page.
10. Logout calls `POST /auth/logout` and clears the query cache.
11. Cleared cache causes `AuthGuard` to redirect.

## Session setup

- The frontend does not store tokens manually.
- The mock API sets an HTTPOnly cookie on `/login`.
- The current user is cached in React Query under `queryKeys.auth.me()`.
- Shared auth query keys live in `src/config/query-keys.ts`.
- Protected routes check if the user exists in context.
- Protected routes can also pass a `PageAccess` value to check whether the user may open that page.

## Route Access

Auth and page access are related, but they are not the same thing.

- auth answers: "Is there a logged-in user?"
- page access answers: "Can this logged-in user open this page?"

Use `AuthGuard page={...}` for protected pages that need page-level permission checks.

```tsx
<AuthGuard page="users:master-page">
  <AppLayout>{page}</AppLayout>
</AuthGuard>
```

Page access rules are defined with `allowPage()` in `src/utils/permissions.ts`. See [Permissions](./08_permissions.md) for the full pattern.

## Simple example

Use `useUser()` when a component needs the current user or logout action.

```tsx
import { useUser } from '@/hooks'

function UserMenu() {
  const { user, logout } = useUser()

  if (!user) {
    return null
  }

  return (
    <button type="button" onClick={() => void logout.mutate()}>
      Log out
    </button>
  )
}
```

## Local development

- The login form already fills in the default mock credentials.
- Use `admin@example.com` and `admin123` when you need to log in manually.
- The `redirectTo` query param is used to return the user to the page they originally requested, it can be used to intentionally redirect user on login, for eg. links received via email.

[Shared Components →](./02_shared_components.md)
