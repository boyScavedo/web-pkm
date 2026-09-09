# Phase 01: Foundation

## Status: PENDING (awaiting credentials)

## Objectives

Set up the Next.js application foundation, database connection, authentication,
environment configuration, and basic shell/layout.

## Prerequisites

- Neon DATABASE_URL (pooled, with `-pooler` suffix)
- Neon DATABASE_URL_UNPOOLED (direct, for migrations)
- AUTH_SECRET (generate: `openssl rand -base64 32`)

## Tasks

### 1. Environment configuration
- Create `.env.example` with all required variables
- Create `.env.local` with placeholders (gitignored)
- Set up `drizzle.config.ts` with pooled + unpooled URLs

### 2. Drizzle setup
- Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
- Create `src/lib/db/schema.ts` (all tables from SCHEMA.md)
- Create `src/lib/db/index.ts` (db client with Neon driver)
- Generate initial migration
- Create `src/lib/db/migrate.ts` migration runner

### 3. Authentication
- Install `next-auth@beta` (v5)
- Configure NextAuth with Drizzle adapter
- Create auth configuration (credentials provider initially)
- Create `/api/auth/[...nextauth]` route handler
- Create `auth()` helper for session access
- Create sign-in page

### 4. App structure
```
src/
  app/
    (app)/
      layout.tsx        — authenticated shell (sidebar + topbar)
      page.tsx          — dashboard redirect
      notes/
        page.tsx        — notes list
        [id]/
          page.tsx      — note view/edit
    (auth)/
      layout.tsx        — auth layout
      sign-in/
        page.tsx        — sign-in form
    api/
      auth/
        [...nextauth]/
          route.ts      — NextAuth handler
      notes/
        route.ts        — notes list/create
        [id]/
          route.ts      — note read/update/delete
    layout.tsx          — root layout
    page.tsx            — redirect to app
  lib/
    db/
      schema.ts         — Drizzle schema
      index.ts          — db client
      migrate.ts        — migration runner
    pkm/                — (empty, Phase 03+)
    auth/               — auth helpers
  components/
    ui/                 — design system primitives
    layout/
      sidebar.tsx       — navigation sidebar
      topbar.tsx        — top bar with search
    auth/
      sign-in-form.tsx  — sign-in form
  types/
    index.ts            — shared types
```

### 5. Basic shell/layout
- Sidebar with PARA navigation (Inbox, Projects, Areas, Resources, Archives)
- Sidebar with Notes, Tags, Folders links
- Top bar with search placeholder
- AMOLED black theme (design system colors)
- JetBrains Mono font

### 6. Design system primitives
- Button component (primary, secondary, ghost)
- Input component
- Badge/tag component
- Card component
- Basic layout components (Container, Stack)

## Completion criteria

- [ ] `.env.example` exists with all placeholders
- [ ] Drizzle schema compiles and generates migration
- [ ] Migration runs against Neon database
- [ ] Auth sign-in/sign-out works
- [ ] Dashboard layout renders with sidebar and topbar
- [ ] AMOLED theme applied correctly
- [ ] Build passes
- [ ] Lint passes
- [ ] CURRENT_STATE.md updated
- [ ] CHANGELOG.md updated
