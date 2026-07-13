# Dialogs And Alerts

## When to use each one

- Use a dialog for create and edit forms.
- Use a confirmation alert for destructive actions.

The policy holders feature shows both patterns.

## Dialog pattern

`PolicyHolderFormDialog` wraps the shared dialog primitives and mounts `PolicyHolderForm` inside the dialog.

Used like this:

```tsx
<PolicyHolderFormDialog>
  <Button>Create a policy holder</Button>
</PolicyHolderFormDialog>
```

For edit, pass the current entity.

```tsx
<PolicyHolderFormDialog policyHolder={policyHolder}>
  <Button>Edit policy holder</Button>
</PolicyHolderFormDialog>
```

## Alert pattern

`PolicyHolderDeleteDialog` is a small feature wrapper around the shared `ConfirmDialog`.

Use it like this:

```tsx
<PolicyHolderDeleteDialog policyHolder={policyHolder}>
  <Button variant="destructive">Delete policy holder</Button>
</PolicyHolderDeleteDialog>
```

## Why this pattern works well

- The shared component handles the primitive behavior.
- The feature wrapper owns the text, labels, and mutation.
- The page stays small and easy to read.

## Trigger pattern

Both dialog wrappers use `children` as the trigger.

That means the page decides what the trigger button looks like, while the dialog component decides what happens after the click.

## Async behavior

- Dialogs track whether an action is idle, pending, or closed.
- Forms report `pending`, `success`, or `idle` through `onStatusChange`.
- The wrapper closes the dialog after a successful form submission.
- Pending actions disable buttons and show a spinner.

[← Forms](./06_forms.md) | [Permissions →](./08_permissions.md)
