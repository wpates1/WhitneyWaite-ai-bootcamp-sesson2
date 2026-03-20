# Testing Guidelines

## Overview

All new features must include appropriate tests. Tests must be isolated, independent, and repeatable across multiple runs. This document defines the testing strategy, conventions, and tooling for this project.

---

## Unit Tests

- **Framework**: Jest
- **Purpose**: Test individual functions and React components in isolation
- **File naming**: `*.test.js` or `*.test.ts`
- **Backend location**: `packages/backend/__tests__/`
- **Frontend location**: `packages/frontend/src/__tests__/`
- **File naming convention**: Name test files to match what they're testing
  - e.g., `app.test.js` for testing `app.js`

---

## Integration Tests

- **Framework**: Jest + Supertest
- **Purpose**: Test backend API endpoints with real HTTP requests
- **File naming**: `*.test.js` or `*.test.ts`
- **Location**: `packages/backend/__tests__/integration/`
- **File naming convention**: Name files based on what they test
  - e.g., `todos-api.test.js` for TODO API endpoints

---

## End-to-End (E2E) Tests

- **Framework**: Playwright (required — do not use Cypress or other frameworks)
- **Purpose**: Test complete UI workflows through browser automation
- **File naming**: `*.spec.js` or `*.spec.ts`
- **Location**: `tests/e2e/`
- **File naming convention**: Name files based on the user journey they test
  - e.g., `todo-workflow.spec.js`

### E2E Rules

- **One browser only** — configure Playwright to run against a single browser
- **Page Object Model (POM)** — all E2E tests must use the POM pattern for maintainability
- **Scope**: Limit to **5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage
- Each test must be fully **isolated and independent**; do not chain or depend on other tests

---

## Port Configuration

Always use environment variables with sensible defaults for port configuration to support dynamic detection in CI/CD workflows.

| Layer    | Configuration                              |
|----------|--------------------------------------------|
| Backend  | `const PORT = process.env.PORT \|\| 3030;` |
| Frontend | React default is `3000`; override with the `PORT` environment variable |

---

## General Principles

- **Isolation**: Every test must set up its own data. Tests must not rely on state left by other tests.
- **Setup & teardown**: Use `beforeEach`/`afterEach` (or `beforeAll`/`afterAll`) hooks to prepare and clean up test state so tests succeed on multiple consecutive runs.
- **New features**: All new features must include appropriate unit, integration, or E2E tests depending on scope.
- **Maintainability**: Tests should be readable, focused, and follow the same code quality standards as production code.
- **Naming**: Test descriptions should clearly state what is being tested and what the expected outcome is.

---

## Running Tests

```bash
# Run unit and integration tests for all packages
npm test

# Run E2E tests
npm run test:e2e

# Run all tests (unit, integration, and E2E)
npm run test:all
```
