# Git And Versioning

## Branches

All changes go through a non-`main` branch.

`main` receives changes only through pull requests that are squash merged.

Optional branch name examples:

- `feat/add-policy-holder-flow`
- `fix/user-detail-loading-state`
- `chore/eslint-optimizations`

## Commits

On a non-`main` branch, commit however is useful while working.

Branch commit history does not need to be perfect because the pull request is squash merged into `main`.

## Pull Requests

The PR title and description are important because they become the squash commit title and description.

Keep PR titles and descriptions short, simple, and clear.

Use proper Markdown in PR descriptions. Wrap technical names like `CYCLE_CHECK_ENABLED`, `eslint.config.js`, `package.json`, and `eslint-plugin-import` in backticks.

## PR Title

Use one of these prefixes:

- `feat`
- `fix`
- `chore`

Format:

```text
prefix: Short title
```

Examples:

```text
chore: Eslint optimizations
feat: Add policy holder detail page
fix: Handle missing user details
```

## PR Description

Always use this Markdown structure:

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

Avoid long explanations unless the change needs them.

## Squash Merge

Before merging, copy the PR title into the squash commit title.

Copy the PR description into the squash commit description.

The final commit on `main` should explain what changed, why it changed, and how it changed.
