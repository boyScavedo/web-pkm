# Known Issues

## Current

- Self-FK on `folders.parent_id` intentionally absent (Drizzle circular type
  inference); service layer must validate parent references.
- Revision triggers are hand-applied SQL, not in Drizzle migrations
  (`psql db -f src/lib/db/triggers.sql` after `db:migrate`).
- Neon project has no `preview` branch — `development` doubles as preview
  (Vercel previews and local work all use DEV_*).
- Notes list is capped at 50 rows on the UI page (service default 20,
  clamp 100) with no load-more control yet.
- Soft-deleted notes have no trash/restore UI (REST endpoint exists;
  restore is exercised by tests only).
- Notes E2E rows are soft-deleted, not removed, so the `notes` table
  accumulates one soft-deleted row per E2E run until a hard-cleanup exists.
- `next dev` logs `The destination stream closed early` intermittently
  during E2E navigations; tests pass and it does not reproduce on `build`.

## Risks

1. **Tiptap `@tiptap/markdown` early release**: May have edge cases with complex custom syntax (wikilinks, frontmatter). Fallback: MDXEditor.
2. **Neon free tier**: 100 CU-hours/month, scale-to-zero after 5 min. Cold starts may affect UX during development.
3. **Single maintainer on MDXEditor**: If we need to fall back from Tiptap, MDXEditor has bus factor risk.

## Mitigations

- Tiptap risk: Test wikilink and frontmatter round-trip early (Phase 04)
- Neon cold start: Acceptable for development; production would need paid plan
- MDXEditor risk: Only relevant if Tiptap fails; unlikely given Tiptap's ecosystem size
