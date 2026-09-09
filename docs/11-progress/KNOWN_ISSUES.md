# Known Issues

## Current

- Self-FK on `folders.parent_id` intentionally absent (Drizzle circular type
  inference); service layer must validate parent references.
- Revision triggers are hand-applied SQL, not in Drizzle migrations
  (`psql db -f src/lib/db/triggers.sql` after `db:migrate`).
- PRD Neon project was EMPTY (no tables) at 2026-09-09 — that caused the
  preview `relation "workspaces" does not exist` 500s and would take
  production down on the dev→main merge. Fixed by the preview-branch staging
  runbook (issue #6): structure lands on a PRD `preview` branch first, Vercel
  previews use it, PRD main is migrated only at promotion.
- Older preview deployments also lacked `AUTH_SECRET` (MissingSecret on
  `/api/auth/callback/credentials`) — confirm it is set in the Vercel preview
  scope alongside the DB URLs.
- Vault is mid-transition (Phase 03): the file explorer is an empty state, the
  editor is the legacy /notes form, and legacy notes/folders/tags/projects
  pages are still reachable by URL without prominent navigation. Retired as
  each Stage 03.x lands (tree 03.2, editor 03.3).
- Properties panel ("+ new metadata") not yet built — the note_properties
  table exists but nothing writes or reads it (03.4).
- Plugin system + graph view not yet built (03.7).
- Soft-deleted notes have no trash/restore UI (REST endpoint exists;
  restore is exercised by tests only).
- Notes E2E rows are soft-deleted, not removed, so the `notes` table
  accumulates one soft-deleted row per E2E run until a hard-cleanup exists.
- `next dev` logs `The destination stream closed early` intermittently
  during E2E navigations; tests pass and it does not reproduce on `build`.

## Risks

1. **CodeMirror 6 live preview is the long-pole build** (03.3): inline
   decorations, block widgets, fold. De-risked by spike-first merge ordering;
   source + reading mode land before any live-preview work.
2. **Neon free tier**: 100 CU-hours/month, scale-to-zero after 5 min. Cold
   starts may affect UX during development.
3. **10k-note performance budget** (p95 <500 ms by operation): enforced per
   stage with load-bench integration tests; graph render needs degree pruning.

## Mitigations

- Live preview: split into two merges; keep the Obsidian-identical source and
  reading modes as the always-present fallback
- Neon cold start: acceptable for development; production would need paid plan
- Load budget: aggregated single-round-trip note reads, indexed tree/search
  queries, bounded graph query (PHASE-03)