# ADR-001: Drizzle ORM

## Status

Accepted

## Context

We need a TypeScript ORM for Neon PostgreSQL that works on Vercel serverless,
supports Drizzle Kit migrations, and has a small bundle footprint.

## Decision

Use Drizzle ORM with the `drizzle-orm/neon-http` driver.

## Alternatives considered

- **Prisma**: Full-featured, larger bundle (600KB vs 7.4KB), requires adapter for Neon, heavier runtime.
- **TypeORM**: Less TypeScript-native, heavier, less serverless-friendly.
- **Kysely**: Good, but Drizzle's schema-as-code approach is more ergonomic for our use case.
- **Raw SQL**: Maximum control, but no type safety, no migration tooling.

## Reasoning

- 7.4KB gzipped bundle (80x smaller than Prisma)
- Native `drizzle-orm/neon-http` driver, no adapter needed
- SQL-first API gives full control over queries (prevents N+1)
- Drizzle Kit generates SQL migrations from TypeScript schema
- `sql` tagged template for raw SQL escape hatch
- Edge/serverless native, no binary dependencies
- Neon's own docs recommend Drizzle

## Consequences

- Manual join control (pro: explicit, con: more verbose than Prisma's `include`)
- Schema inferred at build time, not runtime (pro: smaller, con: requires `drizzle-kit generate`)
- The Neon serverless driver works with any PostgreSQL (migration-ready to VPS)
