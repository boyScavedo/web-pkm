# Current State

Last updated: 2026-09-09

## Phase

**Phase 01 — Foundation** — COMPLETE
**Phase 02 — Notes CRUD** — COMPLETE
**Phase 03 — Markdown Editor / Reader (Tiptap)** — NEXT

## What exists

- Next.js 16.3.4 + React 19 + TypeScript + Tailwind CSS 4 — build, lint,
  typecheck all green
- Drizzle ORM schema: 17 tables (users, accounts, sessions,
  verification_tokens, workspaces, workspace_users, folders, notes, tags,
  note_tags, note_links, note_properties, note_revisions, assets,
  note_assets, projects, project_notes) + PARA/status enums, ltree folder
  paths, generated tsvector search column, GIN trigram indexes
- Migrations applied to BOTH Neon branches (main + development); revision
  trigger, ltree, pg_trgm live on both
- Auth: NextAuth v5, JWT strategy, Credentials provider (env-based
  single user, sha256 + timingSafeEqual), Drizzle adapter attached
  (DATABASE_URL present). Sign-in page, session guard, sign-out.
- Shell: AMOLED dark theme (black bg, cyan accent, monospace), Sidebar
  (PARA + system nav), Topbar
- UI primitives: Button, Input, Badge, Card; `cn()` helper
- **Notes CRUD** (Phase 02): service layer `src/lib/pkm/notes.ts`
  (create/get/list-with-filters/update/soft-delete/restore), REST API under
  `/api/notes` (list+create, get/patch/delete by id, restore) with
  `{data,error}` envelope + session guard, live notes list at `/notes` with
  PARA filter, create form at `/notes/new`, view/edit form at `/notes/[id]`.
  Default workspace provisions itself lazily.
- **Testing**: Vitest (15 unit + 16 integration against real dev Neon) +
  Playwright E2E (4: auth redirect, sign-in, notes page, full notes
  create/edit/delete flow); `npm run test` chains all three. GitHub Actions
  CI runs lint/typecheck/unit/integration/e2e on every PR to dev/main and
  push to dev.
- **Workflow contract** in `docs/00-project/WORKFLOW.md` + AGENTS.md: branch
  model (feature/*→dev→main), squash feature→dev, merge-commit dev→main,
  PR-as-debug-record, Neon mirror, phase order, test gate, repo settings +
  branch protection enforced.
- `.env.local` (chmod 600): AUTH_SECRET + PKM_EMAIL/PKM_PASSWORD;
  `.env` holds PROD_*/DEV_* DB URLs + active DATABASE_URL pair

## What's next

Phase 03: Tiptap markdown editor/reader wired into `/notes/[id]` and
`/notes/new`. After that Phase 04: properties, folders, tags UI.

**Blocker**: none.

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
- Merges: squash feature→dev, merge-commit dev→main (WORKFLOW.md)
- Default workspace is a single lazily-provisioned `default` row (Phase 02)
- Notes API serializes explicit wire shapes; computed columns never leak
- Auth tables use adapter's snake_case column property names (accounts only);
  folders keep no self-FK (service validates parent); parent_id is plan-integer
- DB client is lazy (`getDb()`) so build/sign-in run before DATABASE_URL exists
- Flat limit/offset pagination on notes list (default 20, clamp 100)

## Storage estimate

At 5,000 notes averaging 5KB each: ~35MB total (data + indexes).
Comfortable headroom within 0.5GB Neon limit.

## Risks

- Tiptap @tiptap/markdown is labeled "early release" — may have edge cases
- Single maintainer on MDXEditor (backup option) — smaller ecosystem
- Neon free tier: 100 CU-hours/month, scale-to-zero after 5 min