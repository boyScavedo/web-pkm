# web-pkm

Personal Knowledge Management System and Personal Operating System.

Single-user, Markdown-canonical, API-first. Built to be the canonical data layer
from which future applications (web, mobile, external) consume knowledge.

## Stack

- Next.js 16 / React 19 / TypeScript / App Router
- Neon PostgreSQL (0.5GB free tier, migration-ready to VPS)
- Drizzle ORM
- Cloudflare R2 (object storage)
- Tiptap v3 (Markdown WYSIWYG editor)
- Tailwind CSS 4
- Playwright (E2E testing)

## Repository

- `src/` — application source
- `docs/` — project memory (this system)
- `e2e/` — Playwright tests
- `drizzle.config.ts` — Drizzle Kit configuration

## Constraints

- Single user initially, multi-workspace-ready schema
- 0.5GB Neon storage limit (comfortably sufficient for 10K+ notes)
- No vendor lock-in: every extension and feature is standard PostgreSQL
- Easy migration path: `pg_dump` / `pg_restore` to any VPS PostgreSQL
