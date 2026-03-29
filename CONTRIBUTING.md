# Contributing to the SnapAPI JavaScript/TypeScript SDK

Thank you for your interest in contributing! This guide will get you set up and your PR merged quickly.

## Code of Conduct

Be respectful. Constructive feedback only. See [Contributor Covenant](https://www.contributor-covenant.org/).

## Getting Started

### Prerequisites

- Node.js
- Git

### Fork and Clone

```bash
git clone https://github.com/Sleywill/snapapi-js.git
cd snapapi-js
```

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm test
```

All tests must pass before submitting a PR.

## Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b fix/your-bug-description
   # or
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** — keep each commit focused on a single change.

3. **Write or update tests** — every bug fix and new feature needs a test.

4. **Run the test suite** and confirm it passes.

5. **Update documentation** — update README.md and docstrings/comments as needed.

6. **Update CHANGELOG.md** — add an entry under `[Unreleased]`.

7. **Push your branch** and open a Pull Request.

## Pull Request Guidelines

- Keep PRs small and focused — one feature or fix per PR
- Write a clear PR title: `fix: handle 429 retry-after header correctly`
- Reference the related issue with `Closes #123`
- Add tests for every change
- All CI checks must be green before merge

## Reporting Bugs

Use the [Bug Report template](https://github.com/Sleywill/snapapi-js/issues/new?template=bug_report.md).

Include:
- SDK version
- Node.js version
- Minimal reproduction code
- Full error message and stack trace

## Suggesting Features

Use the [Feature Request template](https://github.com/Sleywill/snapapi-js/issues/new?template=feature_request.md).

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Longer explanation if needed.

Closes #123
```

Types: `fix`, `feat`, `docs`, `refactor`, `test`, `chore`

## Code Style

- Follow existing conventions in the codebase
- Run linting before committing (see project README)
- Keep public APIs backward-compatible unless it's a major version bump

## Questions?

Open a [Discussion](https://github.com/Sleywill/snapapi-js/discussions) or email support@snapapi.pics.
