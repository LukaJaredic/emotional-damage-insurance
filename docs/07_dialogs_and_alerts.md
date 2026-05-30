# Dialogs And Alerts

## When to use each one

- Use a dialog for create and edit forms.
- Use a confirmation alert for destructive actions.

The users feature shows both patterns.

## Dialog pattern

`UserFormDialog` wraps the shared dialog primitives and mounts `UserForm` inside the dialog.

Used like this:

```tsx
<UserFormDialog>
  <Button>Create a user</Button>
</UserFormDialog>
```

For edit, pass the current entity.

```tsx
<UserFormDialog user={user}>
  <Button>Edit this user</Button>
</UserFormDialog>
```

## Alert pattern

`UserDeleteDialog` is a small feature wrapper around the shared `ConfirmDialog`.

Use it like this:

```tsx
<UserDeleteDialog user={user}>
  <Button variant="destructive">Delete this user</Button>
</UserDeleteDialog>
```

## Why this pattern works well

- The shared component handles the primitive behavior.
- The feature wrapper owns the text, labels, and mutation.
- The page stays small and easy to read.

## Trigger pattern

Both dialog wrappers use `children` as the trigger.

That means the page decides what the trigger button looks like, while the dialog component decides what happens after the click.

## Async behavior

- Both `UserFormDialog` and `ConfirmDialog` track `idle`, `pending`, and `closed` state.
- Forms "don't know" that they are in a `Dialog`, so they track `success` instead of `closed` - which is later converted by their `Dialogs`.
- Pending actions disable buttons and show a spinner.
- Successful actions close the dialog via mentioned conversion `success` -> `closed`.

[← Forms](./06_forms.md) | [Testing →](./08_testing.md)
