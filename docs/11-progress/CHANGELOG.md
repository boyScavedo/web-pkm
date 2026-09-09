# Changelog

All notable changes to the web-pkm project.

Format: YYYY-MM-DD — description.

## 2026-09-09 — Phase 01 complete (pending DB credentials)

- Installed: drizzle-orm, drizzle-kit, @neondatabase/serverless, next-auth,
  @auth/drizzle-adapter, dotenv, clsx, tailwind-merge, tsx
- Drizzle schema: 17 tables + PARA/status enums, ltree folder paths,
  generated tsvector, GIN trigram indexes, partial indexes
- Migration `drizzle/0000_ambiguous_mister_fear.sql` (extensions + 17 tables);
  `src/lib/db/triggers.sql` for revision snapshots
- Auth: NextAuth v5 JWT + Credentials (env single user), adapter auto-attaches
  on DATABASE_URL. Sign-in page, session guard, sign-out.
- AMOLED shell: Sidebar/Topbar, notes list empty state, placeholder pages,
  Button/Input/Badge/Card primitives
- Build, lint, typecheck green; sign-in loop verified end to end
- Notes: accounts table uses adapter's snake_case property names; folders have
  no self-FK (service validates); db client is lazy so build/sign-in work
  before DATABASE_URL exists

## 2026-09-09 — Phase 00 complete

- Created project memory system (`/docs/`)
- Completed research: PKM, PARA, GTD, Second Brain, Obsidian, Content Systems, Life OS
- Designed database schema (14 tables, 15+ indexes)
- Analyzed storage budget: comfortable within 0.5GB Neon limit
- Documented migration strategy: pg_dump/pg_restore to VPS PostgreSQL
- Selected stack: Drizzle ORM, Tiptap v3, NextAuth v5, Cloudflare R2, PostgreSQL FTS
- Created 12 ADRs documenting architectural decisions
- Defined design system (AMOLED black, cyan accent, monospace)
- Defined API specification
- Defined test strategy and E2E matrix
- Defined Phase 01 plan (foundation)
