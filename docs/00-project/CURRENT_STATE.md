# Current State

Last updated: 2026-09-09

## Phase

**Phase 01 — Foundation** — COMPLETE
**Phase 02 — Notes CRUD** — COMPLETE
**Phase 03 — Obsidian 1:1 Vault Base** — IN PROGRESS (Stage 0 done, stages 03.2-03.8 ahead; see PHASE-03.md)

## What exists

- Next.js 16.3.4 + React 19 + TypeScript + Tailwind CSS 4 — build, lint,
  typecheck all green
- Drizzle ORM schema: 17 tables (users, accounts, sessions,
  verification_tokens, workspaces, workspace_users, folders, notes, tags,
  note_tags, note_links, note_properties, note_revisions, assets,
  note_assets, projects, project_notes) + PARA/status enums, ltree folder
  paths, generated tsvector search column, GIN trigram indexes
- Migrations applied to the `development` branch; `main` branch was EMPTY (no
  tables) as of 2026-09-09. Production is structured at promotion time via the
  preview-branch staging runbook (issue #6) — see WORKFLOW.md "DB staging
  runbook". `preview` branch created + migrated 2026-09-09.
- Auth: NextAuth v5, JWT strategy, Credentials provider (env-based
  single user, sha256 + timingSafeEqual), Drizzle adapter attached
  (DATABASE_URL present). Sign-in page, session guard, sign-out from ribbon.
- **Vault frame (Phase 03 stage 0)**: Obsidian 1:1 layout — Ribbon, File
  Explorer (empty state), TabStrip, StatusBar — on the (app) shell. Vault
  home at `/`. Sidebar/Topbar dashboard retired; PARA removed from vault UI
  (columns/API remain for the separate dashboard project). Dark AMOLED +
  monospace retained. Vault icon set: hand-rolled Lucide-grammar SVGs.
- UI primitives: Button, Input, Badge, Card; `cn()` helper
- **Notes CRUD** (Phase 02): service layer `src/lib/pkm/notes.ts`
  (create/get/list-with-filters/update/soft-delete/restore), REST API under
  `/api/notes` (list+create, get/patch/delete by id, restore) with
  `{data,error}` envelope + session guard. Legacy `/notes` list + create/edit
  form pages still reachable by URL during the vault transition.
- **Testing**: Vitest (15 unit + 17 integration against real dev Neon) +
  Playwright E2E (auth+vault frame + notes create/edit/delete flow);
  `npm run test` chains all three. GitHub Actions CI runs
  lint/typecheck/unit/integration/e2e on every PR to dev/main and push to dev.
- **Workflow contract** in `docs/00-project/WORKFLOW.md` + AGENTS.md: branch
  model (feature/*→dev→main), squash feature→dev, merge-commit dev→main,
  PR-as-debug-record, preview-branch DB staging (one Neon project, branches
  main/development/preview), phase order, test gate, repo settings + branch
  protection enforced.
- `.env.local` (chmod 600): AUTH_SECRET + PKM_EMAIL/PKM_PASSWORD;
  `.env` holds PROD_*/DEV_* DB URLs + active DATABASE_URL pair

## What's next

Phase 03 stages, in order: file explorer + folders API (03.2) → CodeMirror 6
editor with source/live-preview/reading (03.3) → properties panel (03.4) →
wikilinks/backlinks/outline (03.5) → search + quick switcher (03.6) → plugin
framework + graph view (03.7) → public API for the dashboard project (03.8).

**Blocker**: none.

## Key decisions made

- ORM: Drizzle (ADR-001)
- Editor: CodeMirror 6, three modes (ADR-013; supersedes ADR-002/Tiptap)
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
- Properties: `note_properties` table = source of truth; YAML only at
  import/export (ADR-014)
- Plugins: curated/bundled framework, graph = first plugin (ADR-015)
- Vault UI = Obsidian 1:1 frame; PARA removed from vault navigation (kept in
  DB + API for the separate dashboard project)
- Merges: squash feature→dev, merge-commit dev→main (WORKFLOW.md)
- Default workspace is a single lazily-provisioned `default` row, now
  conflict-safe via `provisionWorkspace` (issue #8)
- Notes API serializes explicit wire shapes; computed columns never leak
- DB client is lazy (`getDb()`) so build/sign-in run before DATABASE_URL exists
- Flat limit/offset pagination on notes list (default 20, clamp 100)

## Storage estimate

At 5,000 notes averaging 5KB each: ~35MB total (data + indexes).
Comfortable headroom within 0.5GB Neon limit.

## Risks

- CodeMirror 6 live preview is the long-pole build (03.3); source + reading
  land first as the fallback
- 10k-note performance budget (p95 <500 ms per operation) — enforced by
  per-stage load-bench integration tests
- Neon free tier: 100 CU-hours/month, scale-to-zero after 5 min