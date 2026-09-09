# Known Issues

## Current

- Self-FK on `folders.parent_id` intentionally absent (Drizzle circular type
  inference); service layer must validate parent references.
- Revision triggers are hand-applied SQL, not in Drizzle migrations
  (`psql db -f src/lib/db/triggers.sql` after `db:migrate`).
- Neon project has no `preview` branch — `development` doubles as preview
  (Vercel previews and local work all use DEV_*).

## Risks

1. **Tiptap `@tiptap/markdown` early release**: May have edge cases with complex custom syntax (wikilinks, frontmatter). Fallback: MDXEditor.
2. **Neon free tier**: 100 CU-hours/month, scale-to-zero after 5 min. Cold starts may affect UX during development.
3. **Single maintainer on MDXEditor**: If we need to fall back from Tiptap, MDXEditor has bus factor risk.

## Mitigations

- Tiptap risk: Test wikilink and frontmatter round-trip early (Phase 04)
- Neon cold start: Acceptable for development; production would need paid plan
- MDXEditor risk: Only relevant if Tiptap fails; unlikely given Tiptap's ecosystem size
