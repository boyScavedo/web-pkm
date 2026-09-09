# Changelog

All notable changes to the web-pkm project.

Format: YYYY-MM-DD — description.

## 2026-09-09 — Workspace provisioning race fix

- `getOrCreateDefaultWorkspace` extracted to conflict-safe
  `provisionWorkspace(slug, name)`: on first use, concurrent callers
  (layout + page) no longer duel on `workspaces_slug_unique`
  (surfaced by preview-branch staging, issue #8)

## 2026-09-09 — Phase 02: Notes CRUD

- Service layer `src/lib/pkm/notes.ts`: createNote, getNote,
  getEditableNote, listNotes (limit/offset, para/status/favorite filters,
  sort/order), updateNote, softDeleteNote, restoreNote, lazy
  getOrCreateDefaultWorkspace
- API: `GET/POST /api/notes`, `GET/PATCH/DELETE /api/notes/[id]`,
  `POST /api/notes/[id]/restore` — `{data,error}` envelope, session guard,
  explicit validation, explicit wire shapes (no computed-column leaks)
- UI: live notes list at `/notes` with PARA filter, create form at
  `/notes/new`, view/edit form at `/notes/[id]`; shared `NoteEditor`
  client component; soft-delete + restore endpoints
- Tests: unit (limit/offset helpers), integration (real dev Neon,
  self-cleaning markers), E2E (create → edit → para filter → delete)
- `db.test.ts` pristine-workspace assertion replaced (app now provisions
  one `default` workspace); stale empty-vault E2E assertion replaced
- MASTER_PLAN renumbered (old "PKM Database" phase was absorbed into 01;
  02 = Notes CRUD; Tiptap editor → 03)
- Full gate green: typecheck, lint, 15 unit + 16 integration + 4 E2E, build

## 2026-09-09 — Workflow enforced: squash feature→dev, merge-commit dev→main

- Repo settings: merge commits + squash allowed (no rebase), branch
  auto-delete on merge, auto-merge disabled
- Branch protection (classic): dev requires PR + `test` check
  (enforce_admins off); main requires PR + `test` check (blocks admins too)
- Merge strategy researched (GitHub/GitLab docs) and user-confirmed:
  feature/issue→dev = squash; dev→main = merge commit, human-reviewed
- WORKFLOW.md + AGENTS.md updated to codify the enforced strategy
- PR #2: `fix/workflow-merge-strategy` → dev

## 2026-09-09 — Foundation upgrade: DB live, tests, CI, workflow

- Created Neon `development` branch (git `dev` + all feature work mirrors it);
  migrated schema + triggers on both `main` and `development` branches
- Restructured `.env`: PROD_*/DEV_* DB URL pairs + active DATABASE_URL
- Fixed sign-in redirect bug: `redirectTo` was passed as an authorizationParam
  so login never left /sign-in (found via first real E2E test)
- Test harness: Vitest (unit + integration against real dev DB) + Playwright
  E2E (auth flows). `npm run test` = unit + integration + E2E serially
- GitHub Actions CI: lint, typecheck, unit, integration, E2E on PRs to
  dev/main and pushes to dev
- `docs/00-project/WORKFLOW.md` + AGENTS.md: binding workflow contract
  (branch model, Neon mirror, phase order, test gate, commit/agent rules)

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
