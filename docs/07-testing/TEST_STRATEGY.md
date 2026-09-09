# Test Strategy

## Principles

1. Test user-visible behavior, not implementation details
2. Playwright for browser-level validation
3. Isolated test data, never depend on production
4. Tests run against a real database (Neon branch or local PostgreSQL)
5. Every significant UI feature gets at least one E2E test

## Test layers

### Unit tests
- Service functions (`lib/pkm/*.ts`)
- Markdown parsing/link extraction utilities
- Validation functions
- Run with: `vitest` or `node --test`

### Integration tests
- Route Handlers with real database
- Drizzle schema/migration tests
- Search query correctness
- Run with: Vitest + test database

### E2E tests (Playwright)
- Full user workflows in browser
- CRUD operations
- Search and filtering
- Import/export
- Visual regression screenshots
- Run with: `npx playwright test`

## Database for tests

- Neon branching: create a branch per test run (clean state)
- Alternatively: local PostgreSQL via Docker for CI
- Never test against the production Neon database

## Test data

- Fixtures in `e2e/fixtures/`
- Sample notes, folders, tags pre-created
- Each test cleans up after itself
- Test isolation: tests don't depend on execution order

## CI/CD

- Lint on every commit
- Type check on every commit
- Unit tests on every commit
- E2E tests on PR / before deploy
- Visual regression on major UI changes
