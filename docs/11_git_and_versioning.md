# Git And Versioning

## Branches

Work on a non-`main` branch and merge through a pull request. Pull requests are squash or rebase merged into `main`.

## Commits

Use clear commit messages while working. The branch history does not need to be perfect because it is squash merged.

## Pull Requests

Use a short title with one of these prefixes:

- `feat`
- `fix`
- `chore`

```text
feat: Add policy detail page
fix: Handle missing user details
chore: Update ESLint checks
```

The description should briefly explain what changed and why. Add implementation details only when they help the reviewer.

A simple structure is enough:

```md
## What

Adds XYZ to the app.

## Why

Keeps XYZ behavior clear.

## How

Updates `src/...` and configures `package-name`.
```

Write descriptions in third-person present tense.

Good examples:

- Adds XYZ to the app.
- Fixes XYZ loading behavior.
- Updates `eslint.config.js` to skip expensive checks during development.

When a PR has multiple points, use matching numbered lists across `What`, `Why`, and `How`.

```md
## What

1. Optimizes ESLint during development.
2. Separates Prettier formatting from ESLint checks.
3. Adds Git and versioning documentation.

## Why

1. Keeps save-time, lint, and commit workflows faster.
2. Avoids running Prettier twice through editor and ESLint flows.
3. Makes branch, PR, and squash merge expectations explicit.

## How

1. Disables `import/no-cycle` during normal `npm run lint`, adds `npm run lint:with-cycle-check`, and runs it during pre-push.
2. Removes `eslint-plugin-prettier` and keeps formatting enforced through `npm run format`.
3. Adds `docs/11_git_and_versioning.md` and links it from `README.md`.
```

Avoid long explanations unless the change needs them. The 3 points in previous example are just that - an example. Your PR can have more or less points.
