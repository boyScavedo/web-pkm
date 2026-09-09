# Known Issues

## Current

- No `DATABASE_URL`/`DATABASE_URL_UNPOOLED` in `.env.local` — auth (JWT) and
  build run without them; any DB query will throw until added. After adding:
  `npm run db:migrate` then apply `src/lib/db/triggers.sql`.
- Self-FK on `folders.parent_id` intentionally absent (Drizzle circular type
  inference); service layer must validate parent references.
- Revision triggers are hand-applied SQL, not in Drizzle migrations.

## Risks

1. **Tiptap `@tiptap/markdown` early release**: May have edge cases with complex custom syntax (wikilinks, frontmatter). Fallback: MDXEditor.
2. **Neon free tier**: 100 CU-hours/month, scale-to-zero after 5 min. Cold starts may affect UX during development.
3. **Single maintainer on MDXEditor**: If we need to fall back from Tiptap, MDXEditor has bus factor risk.

## Mitigations

- Tiptap risk: Test wikilink and frontmatter round-trip early (Phase 04)
- Neon cold start: Acceptable for development; production would need paid plan
- MDXEditor risk: Only relevant if Tiptap fails; unlikely given Tiptap's ecosystem size
