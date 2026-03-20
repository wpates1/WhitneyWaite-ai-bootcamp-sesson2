# Coding Guidelines

## Overview

These guidelines apply to all code in this project — both frontend (React) and backend (Node.js/Express). Following them ensures consistency, readability, and maintainability across the codebase.

---

## General Formatting Rules

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Maximum 100 characters per line
- **Semicolons**: Required at the end of every statement
- **Quotes**: Single quotes for strings (`'hello'`), except in JSX attributes which use double quotes (`"value"`)
- **Trailing commas**: Required in multi-line arrays, objects, and function parameters
- **Brace style**: Opening braces on the same line (`if (condition) {`)
- **Blank lines**: One blank line between logical blocks; no more than one consecutive blank line
- **File endings**: Every file must end with a single newline character
- **Encoding**: UTF-8 for all files

---

## Import Organization

Organize imports in the following order, separated by a blank line between each group:

1. **Node built-ins** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `express`, `react`, `@mui/material`)
3. **Internal modules / local files** (e.g., `./App`, `../utils/helpers`)

**Example (backend):**
```js
const path = require('path');

const express = require('express');
const cors = require('cors');

const { db } = require('./database');
```

**Example (frontend):**
```js
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import './App.css';
```

- Remove all unused imports
- Prefer named imports over default imports where possible
- Do not use wildcard imports (`import * as X`)

---

## Linter Usage

This project uses **ESLint** to enforce code quality.

- **Run the linter** before committing: `npx eslint .`
- All ESLint errors must be resolved before merging code
- ESLint warnings should be addressed where practical
- Do not disable ESLint rules with `// eslint-disable` comments unless absolutely necessary — if you must, add a comment explaining why
- The ESLint configuration is defined at the root of the project

---

## Naming Conventions

| Element           | Convention         | Example                     |
|-------------------|--------------------|-----------------------------|
| Variables         | camelCase          | `itemList`, `dueDate`       |
| Functions         | camelCase          | `handleSubmit`, `fetchData` |
| React Components  | PascalCase         | `App`, `TodoItem`           |
| Constants         | UPPER_SNAKE_CASE   | `MAX_RETRIES`, `API_URL`    |
| Files (JS/JSX)    | camelCase or PascalCase for components | `app.js`, `App.js` |
| CSS classes       | kebab-case         | `add-item-section`, `due-date` |

---

## Best Practices

### DRY (Don't Repeat Yourself)
- Extract repeated logic into shared functions or utilities
- Reuse React components rather than duplicating JSX
- Centralize configuration values (e.g., API base URL, port) — never hardcode the same value in multiple places

### Single Responsibility
- Each function or component should do one thing well
- If a function is doing multiple unrelated things, split it

### Clarity Over Cleverness
- Write code that is easy to read and understand
- Prefer explicit, descriptive variable names over short abbreviations
- Avoid deeply nested logic — extract into named functions

### Avoid Magic Numbers / Strings
- Replace inline literals with named constants
  ```js
  // Bad
  if (status === 404) { ... }

  // Good
  const NOT_FOUND = 404;
  if (status === NOT_FOUND) { ... }
  ```

### Error Handling
- Always handle errors at API boundaries (network calls, database operations)
- Return meaningful error messages and appropriate HTTP status codes from the backend
- Display user-friendly error messages in the frontend (never expose raw stack traces)

### Comments
- Write comments to explain *why*, not *what* — the code should be self-explanatory for the *what*
- Keep comments up to date when code changes
- Use JSDoc-style comments for exported functions where the purpose is not immediately obvious

---

## Git & Commit Hygiene

- Write clear, descriptive commit messages in the imperative mood (e.g., `Add due date field to task form`)
- Keep commits focused — one logical change per commit
- Do not commit commented-out code or debug `console.log` statements
