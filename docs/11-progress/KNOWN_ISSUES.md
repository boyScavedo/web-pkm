# Known Issues

## Current

- Self-FK on `folders.parent_id` intentionally absent (Drizzle circular type
  inference); service layer must validate parent references.
- Revision triggers are hand-applied SQL, not in Drizzle migrations
  (`psql db -f src/lib/db/triggers.sql` after `db:migrate`).
- PRD Neon project was EMPTY (no tables) at 2026-09-09 — that caused the
  preview `relation "workspaces" does not exist` 500s and would take
  production down on the dev→main merge. Fixed by the preview-branch staging
  runbook (#6): structure lands on a PRD `preview` branch first, Vercel
  previews use it, PRD main is migrated only at promotion.
- Older preview deployments also lacked `AUTH_SECRET` (MissingSecret on
  `/api/auth/callback/credentials`) — confirm it is set in the Vercel preview
  scope alongside the DB URLs.
- Notes list is capped at 50 rows on the UI page (service default 20,
  clamp 100) with no load-more control yet.
- Soft-deleted notes have no trash/restore UI (REST endpoint exists;
  restore is exercised by tests only).
- Notes E2E rows are soft-deleted, not removed, so the `notes` table
  accumulates one soft-deleted row per E2E run until a hard-cleanup exists.
- `next dev` logs `The destination stream closed early` intermittently
  during E2E navigations; tests pass and it does not reproduce on `build`.
- Sidebar and note-list symbols (`📄`, `#`, `▸`, `●`, `⊡`, `▣`, `▢`, `◇`,
  `▧`, `☆`, `★`) are placeholder emoji/Unicode glyphs that read as
  AI-generated. Banned by DESIGN_SYSTEM.md Iconography; replace with one
  coherent stroke-based SVG set (Feather/Lucide grammar, 24px / 1.5-2px,
  `fg`/`accent`).

## Risks

1. **Tiptap `@tiptap/markdown` early release**: May have edge cases with complex custom syntax (wikilinks, frontmatter). Fallback: MDXEditor.
2. **Neon free tier**: 100 CU-hours/month, scale-to-zero after 5 min. Cold starts may affect UX during development.
3. **Single maintainer on MDXEditor**: If we need to fall back from Tiptap, MDXEditor has bus factor risk.

## Mitigations

- Tiptap risk: Test wikilink and frontmatter round-trip early (Phase 04)
- Neon cold start: Acceptable for development; production would need paid plan
- MDXEditor risk: Only relevant if Tiptap fails; unlikely given Tiptap's ecosystem size
