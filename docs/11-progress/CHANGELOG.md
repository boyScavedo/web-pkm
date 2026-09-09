# Changelog

All notable changes to the web-pkm project.

Format: YYYY-MM-DD — description.

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
