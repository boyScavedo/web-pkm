# Obsidian 1:1 Analysis

## Standing decision

The vault UI is an **Obsidian 1:1: design no difference**. Same frame, same
interaction model, same writing experience. This supersedes the original
2026 note below where the two conflict.

## What 1:1 means here

- Frame: ribbon (icon strip) | file explorer | open-file tabs | editor pane |
  outline/backlinks sidebar | status bar
- Writing experience: CodeMirror 6 source mode + live preview + reading view
  (ADR-013 supersedes the earlier Tiptap WYSIWYG choice)
- File/folder interface: collapsible ltree tree, create/rename/move/delete
- Properties: Obsidian-style panel, added via "+ new metadata"; stored in
  `note_properties` (ADR-014), YAML serialized only at import/export
- Graph view: a plugin, not core (ADR-015) — ships as the first plugin
- Plugins: community-plugin-style extension surface, curated bundles first
- PARA is NOT part of the vault. No PARA navigation, no PARA concepts in the
  UI. The columns/API survive for the separate PARA dashboard project, which
  consumes this project's API.
- The dashboard is a different project. This project is vault + API.

## What Obsidian does well (kept)

- Markdown as canonical format (ADR-006)
- `[[Note]]` / `[[Note|Display text]]` / `[[Note#Heading]]` wikilinks
- Backlinks as a core pane, not an afterthought
- Fast search across the vault — PostgreSQL FTS + pg_trgm (ADR-005)
- Link graph on `note_links` adjacency list, recursive CTE (ADR-011)

## What we do differently (server-first)

- Server + Postgres, not local files; API-first so the dashboard project and
  mobile clients consume the same data
- Properties are structured rows (`note_properties`), not file metadata,
  with a runtime YAML-free read path (perf budget: <500 ms p95 at 10k notes)
- Single user; no CRDT/real-time collab
- Plugins are curated bundles now; sandboxed third-party loading later