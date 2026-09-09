# ADR-003: NextAuth v5 / Auth.js

## Status

Accepted

## Context

We need authentication for a single-user PKM on Next.js 16. Simple email+password
or OAuth, secure session handling, minimal complexity.

## Decision

Use NextAuth v5 (Auth.js) with the Next.js 16 App Router integration.

## Alternatives considered

- **Clerk**: Hosted auth, good DX, but vendor dependency for a single-user app. Overkill.
- **Lucia Auth**: Lightweight, good, but less mature than NextAuth for Next.js integration.
- **Custom JWT**: Maximum control, but reinventing session management, CSRF protection, secure cookies.
- **Supabase Auth**: Tied to Supabase ecosystem. We use Neon.

## Reasoning

- Official Next.js recommended auth solution
- App Router native (v5)
- Session-based with secure HTTP-only cookies
- CSRF protection built-in
- Supports email/password, OAuth providers, magic links
- Works with our Drizzle adapter
- Single-user simplicity: one user record, one workspace

## Consequences

- Auth secret required (environment variable)
- Session table in database (managed by NextAuth)
- Can add OAuth providers later without schema changes
