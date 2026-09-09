# ADR-006: Markdown as Canonical Format

## Status

Accepted

## Context

The editor uses an internal rich-text representation (ProseMirror/Tiptap).
We need to decide what gets persisted to the database and what's the
source of truth.

## Decision

Markdown with YAML frontmatter is the canonical persistence format.
The database `content` column stores Markdown. The editor round-trips
through Markdown on save/load.

## Alternatives considered

- **ProseMirror JSON**: Native to Tiptap, fast read/write, but creates vendor lock-in. Can't export to Obsidian, can't grep notes, can't use standard tools.
- **HTML**: Universal, but lossy for Markdown-specific features (wikilinks, frontmatter, task lists).
- **MDX**: Richer than Markdown, but adds JSX complexity and build step requirements.

## Reasoning

- Portable: export works with any Markdown tool
- Grep-friendly: `rg` can search notes directly
- Version control friendly: diffs are meaningful
- Obsidian-compatible: user can switch tools without data loss
- API consumers get Markdown, not editor-specific JSON
- Tiptap's `@tiptap/markdown` handles bidirectional conversion

## Consequences

- Editor must round-trip cleanly through Markdown (Tiptap's responsibility)
- Frontmatter is YAML, parsed on load, serialized on save
- Wikilinks `[[...]]` are stored as Markdown, parsed to `note_links` rows on save
- Any Markdown that doesn't survive the round-trip is a bug to fix
