# Permissions

## Main Idea

Permissions are built from the current user in `src/utils/permissions.ts`.

There are two kinds of checks:

- `allowPage()` and `canAccess()` control routes and navigation.
- `allow()` and `can()` control actions, records, and fields.

Frontend permissions improve the user experience. Mock API handlers still enforce authorization.

## Page Access

Page names use a singular resource followed by the page type:

- `home`
- `user:master-page`
- `user:detail-page`
- `policy-holder:master-page`
- `policy-holder:detail-page`
- `policy:master-page`
- `policy:detail-page`

Grant page access in the role rules:

```ts
builder
  .allowPage('policy:master-page')
  .allow('policy:read')
  .allow('policy:create')
```

Protect routes with the same page name:

```tsx
protectedRoute('policy:master-page', <PoliciesMasterPage />)
```

Sidebar items use `canAccess()` to hide links the user cannot open. Do not replace page access with a resource read check; these answer different questions.

## Resource Actions

`allow()` defines what a role can do:

```ts
allow(resourceAction, conditions?, allowedFields?)
```

- Conditions restrict the rule to matching records.
- Allowed fields restrict which fields may change.
- Omitting either value means there is no restriction for that part.

Example: an employee may edit basic fields on their own user record.

```ts
builder.allow('user:update', { id: user.id }, [
  'firstName',
  'lastName',
  'email',
])
```

## UI Checks

Use `can()` for the narrowest UI decision:

```tsx
can('user:delete', user)
can('user:update', user, 'email')
can('user:update', user, '*')
```

- Pass a record when the action concerns one record.
- Pass a field name for field-level access.
- Use `'*'` only when asking whether any record or field is allowed.

## Current Roles

- Admins manage users, policy holders, and policies.
- Employees can read these resources, create policy holders and policies, and perform allowed updates. They cannot delete them.
- Customers can access home and their own user detail page.

The source of truth is `src/utils/permissions.ts`.

## Adding A Protected Page

1. Add or reuse a typed `PageAccess` value.
2. Grant it with `allowPage()`.
3. Protect the route with `AuthGuard` or `protectedRoute()`.
4. Add the same access value to its sidebar item.
5. Use `can()` separately for actions inside the page.

[← Dialogs And Alerts](./07_dialogs_and_alerts.md) | [Testing →](./09_testing.md)
