# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│                                                             │
│  Next.js Web App (React 19, App Router, Tailwind CSS 4)    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  Dashboard   │ │   Editor    │ │   Search / Nav      │   │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │               │                   │               │
│  ┌──────┴───────────────┴───────────────────┴──────────┐   │
│  │              React Component Layer                    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │          Service Layer (lib/pkm/)                     │   │
│  │  notes | folders | tags | links | search | assets    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                   │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │     Route Handlers / Server Actions (app/api/)        │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    DATA LAYER                                │
│                         │                                   │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │          Drizzle ORM (schema + query builder)         │   │
│  └──────────┬────────────────────────┬──────────────────┘   │
│             │                        │                      │
│  ┌──────────┴──────────┐  ┌─────────┴──────────────────┐   │
│  │  Neon PostgreSQL    │  │  Cloudflare R2              │   │
│  │  (structured data)  │  │  (binary/file storage)      │   │
│  │                     │  │                              │   │
│  │  notes, folders,    │  │  images, attachments,        │   │
│  │  tags, links,       │  │  exported vaults,            │   │
│  │  revisions, assets  │  │  imported files              │   │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key architectural decisions

### 1. No separate backend service

The entire backend lives inside Next.js (Route Handlers + Server Actions).
This eliminates operational complexity of managing a separate API server.

When the user migrates to VPS, they run the same Next.js app — no backend
to deploy separately.

### 2. Service layer pattern

Database queries never scatter through React components. They live in
`lib/pkm/` as domain-specific modules:

```
lib/pkm/
  notes.ts      — CRUD, search, soft delete, restore
  folders.ts    — hierarchy management, subtree queries
  tags.ts       — create, assign, remove, list by tag
  links.ts      — wikilink parsing, backlinks, broken links
  search.ts     — FTS, fuzzy, filtered search
  assets.ts     — upload, reference, orphan detection
  revisions.ts  — history, restore
```

Route Handlers sit above the service layer. React components call
Route Handlers (or Server Actions) which call services.

### 3. Markdown as canonical format

Every note is Markdown with YAML frontmatter on disk and in the database.
The editor (Tiptap) uses an internal representation for rich editing,
but the persisted format is always Markdown.

This ensures portability, exportability, and tool-agnosticism.

### 4. API-first

Every PKM operation has an API endpoint. The web UI is one consumer.
Flutter, scripts, and external tools consume the same API.

### 5. Database portability

No Neon-specific features. Standard PostgreSQL extensions only (ltree,
pg_trgm). Standard types. `pg_dump` / `pg_restore` works.

### 6. Storage abstraction

Assets go through a storage abstraction layer. R2 is the implementation,
but the application never calls R2 directly from components. The
abstraction allows swapping to S3, MinIO, or local storage.

## Request flow

```
User action → React component → Route Handler → Service function
                                                       ↓
                                                  Drizzle query
                                                       ↓
                                              PostgreSQL / R2
                                                       ↓
                                              Response → UI update
```

## Error handling

- Service functions throw typed errors
- Route Handlers catch and return structured error responses
- React components handle error states in UI
- Database constraint violations map to user-friendly messages

## Caching

- Server-side: Next.js full route cache for read-heavy pages
- Client-side: React Router cache (stale-while-revalidate)
- Database: Partial indexes serve as query-level cache
- No Redis or external cache layer (YAGNI at single-user scale)
