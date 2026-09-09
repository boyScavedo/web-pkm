# Future Considerations

## Near-term (Obsidian 1:1 build-out — PHASE-03, stages 03.2-03.8)

- File explorer + folders API (03.2)
- CodeMirror 6 editor: source / live preview / reading, tabs, autosave (03.3)
- Properties panel, "+ new metadata" (03.4)
- Wikilinks, backlinks, outline (03.5)
- Search + quick switcher / command palette (03.6)
- Plugin framework + graph view plugin (03.7)
- Public API for the separate dashboard project: token auth + full endpoint
  pass (03.8)

## Medium-term

- Sandboxed third-party plugin loading (signature verification, iframe
  capability broker) — API surface already supports it (ADR-015)
- pgvector for semantic search
- Public/read-only knowledge views
- Custom domain for R2 assets (CDN)
- Obsidian vault round-trip testing at scale (import exports YAML frontmatter
  per ADR-014; validate against real Obsidian)
- AI context integration (read-only PKM access)
- Webhook support for external integrations

## Long-term

- Multi-workspace support (RLS policies)
- Collaborative editing (if needed)
- Mobile app (Flutter) consuming the public API (03.8)
- Public knowledge publishing
- Backup automation (scheduled pg_dump to R2)