# ADR-010: Junction Table Tags

## Status

Accepted

## Context

We need tags on notes with efficient filtering.

## Decision

Use junction table (`note_tags`) linking `notes` to `tags`.

## Alternatives considered

- **PostgreSQL array column (`text[]`)**: GIN index, faster multi-tag intersection at 100K+ scale. But no FK constraints, no tag metadata (color, description), harder to query tag counts.
- **hstore**: Key-value, not suited for tags.
- **JSONB array**: Flexible, but no FK constraints, slower queries.

## Reasoning

- Clean foreign key constraints (data integrity)
- Tag metadata (color, description, usage count) lives in `tags` table
- Simple queries: `WHERE tag_id = X` with B-tree index
- At PKM scale (< 1000 tags, < 10K notes), junction table is sub-millisecond
- If multi-tag intersection becomes hot at 100K+ notes, migrate to array+GIN

## Consequences

- Two tables instead of one column (slightly more complex)
- Tag operations are standard SQL (easy to understand, test, debug)
- Tag usage count: `SELECT tag_id, count(*) FROM note_tags GROUP BY tag_id`
