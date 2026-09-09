# Architectural Principles

## 1. The PKM is the canonical data layer

Everything else is an application built on top. Projects, content, and life OS
reference PKM data. They don't duplicate it.

## 2. Markdown is canonical

The database stores Markdown. The editor produces Markdown. Export produces
Markdown. No proprietary format is the source of truth.

## 3. Standard PostgreSQL, no vendor lock-in

Every extension and feature must work on stock PostgreSQL. Migration from
Neon to any VPS is a `pg_dump` / `pg_restore` away.

## 4. Service layer over scattered queries

No raw SQL in React components. Domain logic lives in `lib/pkm/`.
Route Handlers call services. Components call Route Handlers.

## 5. API-first

Every operation has an API. The web UI is a consumer, not the owner.
This enables Flutter, scripts, and external integrations.

## 6. Sub-second at 10K notes

Every query path has a targeted index. Partial indexes on hot subsets.
Covering indexes for list views. GIN for search. GiST for ltree.

## 7. Soft deletion over hard deletion

Notes are soft-deleted (`is_deleted = true`). Data is recoverable.
Hard deletion is an explicit admin action, not a user button.

## 8. Progressive complexity

Build the simplest thing that works. Add complexity only when the simple
version demonstrably falls short. Dashboard before Life OS. CRUD before
graph view. Search before semantic search.

## 9. Single user, not multi-tenant

No row-level security policies, no workspace switching, no invitation
system. The `workspace_id` column exists for future-proofing. The
application assumes one workspace.

## 10. Portable knowledge

The user must never be locked in. Export at any time produces valid
Markdown files with frontmatter, assets, and folder structure. Import
accepts the same format.
