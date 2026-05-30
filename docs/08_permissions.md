# Permissions

## Main idea

Permissions are built centrally from the current user, then read through `usePermissions()` in feature UI.

The main files are:

- `src/utils/permissions.ts` defines role rules with `allow()`.
- `src/utils/permission-builder.ts` implements `allow()` and `can()`.
- `src/app/providers/permissions-provider.tsx` builds permissions for the current user.
- `src/hooks/use-permissions.ts` exposes permissions to components.

## `allow()`

Use `allow()` while building the permission set.

```ts
allow(resourceAction, conditions?, allowedFields?)
```

- `resourceAction` is an action like `user:read`, `user:update`, or `user:delete`.
- `conditions` limit the rule to matching resource instances.
- `allowedFields` limit the rule to specific fields.
- Omitting `conditions` means all instances.
- Omitting `allowedFields` means all fields.

Admin permissions usually grant full access:

```ts
function addAdminPermissions(builder: PermissionsBuilder) {
  builder
    .allow('user:create')
    .allow('user:read')
    .allow('user:update')
    .allow('user:delete')
}
```

Employee permissions can combine broad reads with constrained updates:

```ts
function addEmployeePermissions(builder: PermissionsBuilder, user: User) {
  builder
    .allow('user:read')
    .allow('user:update', { id: user.id }, ['firstName', 'lastName', 'email'])
    .allow('user:update', { roles: ['customer'] }, [
      'firstName',
      'lastName',
      'email',
    ])
}
```

That means the employee can update their own basic profile fields and the same basic fields for customer users.

## `can()`

Use `can()` from `usePermissions()` when rendering UI.

```tsx
const { can } = usePermissions()
```

Ask the narrowest question that matches the UI decision.

For a page-level action, pass the resource instance:

```tsx
return can('user:delete', user) ? (
  <UserDeleteDialog user={user}>
    <Button variant="destructive">Delete this user</Button>
  </UserDeleteDialog>
) : null
```

For an edit trigger that should show when at least one field can be updated, use `'*'` for the field:

```tsx
return can('user:update', user, '*') ? (
  <UserFormDialog user={user}>
    <Button>Edit this user</Button>
  </UserFormDialog>
) : null
```

For field-level forms, check the specific field:

```tsx
function isFieldDisabled(fieldName: keyof UserFormValues) {
  if (!isEdit) {
    return false
  }

  return !can('user:update', user, fieldName)
}
```

## How arguments behave

`can()` accepts:

```ts
can(resourceAction, resourceInstance?, field?)
```

- `can('user:update')` checks whether the user can update all user instances and all fields.
- `can('user:update', user)` checks whether the user can update that user instance and all fields.
- `can('user:update', user, 'email')` checks whether the user can update `email` on that user instance.
- `can('user:update', '*', 'email')` checks whether the user can update `email` on at least one user.
- `can('user:update', user, '*')` checks whether the user can update at least one field on that user instance.
- `can('user:update', '*', '*')` checks whether the user can update at least one field on at least one user.

## Simple rules

- Add permission rules in `src/utils/permissions.ts`, not inside components.
- Use `allow()` to describe roles and ownership rules once.
- Use `can()` in UI to hide actions, disable fields, and avoid showing flows the user cannot complete.
- Prefer passing a real resource instance when the UI is about one specific record.
- Use `'*'` only for "any instance" or "any field" UI checks.
- Treat frontend permissions as UX only. The API still needs to enforce authorization.

[← Dialogs And Alerts](./07_dialogs_and_alerts.md) | [Testing →](./09_testing.md)
