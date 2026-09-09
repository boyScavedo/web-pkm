# ADR-011: Adjacency List Link Graph

## Status

Accepted

## Context

We need to store wikilink relationships between notes and query backlinks,
outgoing links, and graph traversal efficiently.

## Decision

Use adjacency list (`note_links` table) with recursive CTE for traversal.

## Alternatives considered

- **Materialized path**: Fast subtree, but link graph is not a tree (a note can link to anything). Doesn't fit.
- **Closure table**: O(n²) storage for dense graphs. PKM link graphs are sparse.
- **Neo4j / graph database**: Overkill for 1K-10K notes. PostgreSQL handles this.

## Reasoning

- Simple FK relationships: `source_note_id → target_note_id`
- Backlinks: single index scan on `target_note_id`
- Outgoing links: PK covers `source_note_id`
- Recursive CTE for multi-hop traversal: < 100ms at 1K notes
- Rename-safe: update `note_links` rows when target note title changes
- Two B-tree indexes cover all query patterns

## Consequences

- Wikilinks parsed at save time, not read time (pre-computed relationships)
- Unresolved links tracked: parse `[[Nonexistent]]`, don't find target, store as broken
- Graph view (if built) uses recursive CTE — fine at PKM scale
- No need for dedicated graph database
