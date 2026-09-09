# Current State

Last updated: 2026-09-09

## Phase

**Phase 00 — Research + System Design** — COMPLETE

## What exists

- Fresh Next.js 16.3.4 scaffold (React 19, TypeScript, Tailwind CSS 4)
- No application code beyond default scaffold
- No database setup
- No authentication
- No environment configuration

## What's next

Phase 01: Foundation — Next.js app structure, Drizzle setup, auth foundation,
environment configuration, basic shell/layout.

**Blocker**: Neon `DATABASE_URL` and `AUTH_SECRET` needed at Phase 01 credential gate.

## Key decisions made

- ORM: Drizzle (ADR-001)
- Editor: Tiptap v3 + @tiptap/markdown (ADR-002)
- Auth: NextAuth v5 / Auth.js (ADR-003)
- Storage: Cloudflare R2 (ADR-004)
- Search: PostgreSQL GIN FTS + pg_trgm (ADR-005)
- Markdown: Canonical persistence format (ADR-006)
- Import: Markdown + YAML frontmatter + wikilinks (ADR-007)
- API: Domain/service layer above Route Handlers (ADR-008)
- Folders: ltree extension (ADR-009)
- Tags: Junction table (ADR-010)
- Links: Adjacency list with recursive CTE (ADR-011)
- Revisions: Full snapshots, trigger-based (ADR-012)

## Storage estimate

At 5,000 notes averaging 5KB each: ~35MB total (data + indexes).
Comfortable headroom within 0.5GB Neon limit.

## Risks

- Tiptap @tiptap/markdown is labeled "early release" — may have edge cases
- Single maintainer on MDXEditor (backup option) — smaller ecosystem
- Neon free tier: 100 CU-hours/month, scale-to-zero after 5 min
