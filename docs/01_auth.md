# Auth

## Main files

- `src/app/providers/app-provider.tsx` mounts the React Query provider and `UserProvider`.
- `src/app/providers/user-provider.tsx` loads the current user with `useMe()`.
- `src/app/auth-guard.tsx` protects routes and handles redirects.
- `src/features/auth/api/login.ts` handles login - since `useLogin()` is used only in `features/auth`.
- `src/utils/auth-api.ts` handles `useMe()` and `useLogout()` - since they are used outside `features/auth`.

## How auth works

1. The app starts inside `AppProvider`.
2. `UserProvider` calls `useMe()` to load the current user.
3. `AuthGuard` checks whether the current route requires a user.
4. If the user is missing, the app redirects to `/auth/login?redirectTo=...`.
5. The login form submits to `POST /auth/login`.
6. On success, the logged-in user is written into React Query.
7. The app redirects back to the requested page.
8. Logout calls `POST /auth/logout` and clears the query cache.
9. Cleared cache causes `AuthGuard` to redirect.

## Session setup

- The frontend does not store tokens manually.
- The mock API sets an HTTPOnly cookie on `/login`.
- The current user is cached in React Query under `queryKeys.auth.me()`.
- Protected routes check if user exists in context.

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
