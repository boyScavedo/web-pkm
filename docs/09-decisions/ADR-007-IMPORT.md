# ADR-007: Markdown Import Strategy

## Status

Accepted

## Context

Users may import from Obsidian vaults, other PKMs, or plain Markdown
directories. We need a reliable import pipeline.

## Decision

Accept ZIP archives containing Markdown files with YAML frontmatter and
wikilink syntax. Server-side processing pipeline.

## Alternatives considered

- **Direct folder upload**: Browser limitation — can't access filesystem
  directly. ZIP is the practical format.
- **Obsidian JSON export**: Obsidian exports as Markdown, not JSON.
  Markdown import covers it.
- **One-by-one file upload**: Tedious for large vaults. ZIP is better.

## Pipeline

```
ZIP upload
→ extract to temp directory
→ scan for .md files
→ parse YAML frontmatter
→ extract wikilinks [[...]]
→ upload embedded images to R2
→ rewrite image references to asset URLs
→ create notes in database
→ resolve wikilinks to note IDs
→ create note_links rows
→ report results (imported/skipped/failed/warnings)
```

## Consequences

- Duplicate detection by filename + title
- Unresolved links tracked, shown as warnings
- Failed asset uploads logged, notes still created
- Import is idempotent (re-importing same vault skips existing notes)
- ZIP extraction must handle path traversal attacks (security)
- Max ZIP size limit enforced
