# ADR-005: PostgreSQL FTS + pg_trgm Search

## Status

Accepted

## Context

We need fast full-text search across 1K-10K notes with title, content, and
tag filtering. Must be sub-second.

## Decision

Use PostgreSQL built-in full-text search (GIN index on generated tsvector column)
combined with pg_trgm for fuzzy title matching.

## Alternatives considered

- **Meilisearch**: External service, great UX, but adds operational complexity for a single-user PKM. PostgreSQL FTS is sufficient at this scale.
- **Typesense**: Similar to Meilisearch — external service, overkill.
- **pgvector semantic search**: Premature. Add later as extension point.
- **Elasticsearch**: Massively overkill for a personal system.
- **LIKE '%query%'**: Slow at scale, no ranking, no stemming.

## Reasoning

- PostgreSQL FTS with GIN index: sub-100ms at 100K notes
- Generated tsvector column: consistent, auto-updates, weighted ranking (title = A, content = B)
- pg_trgm: typo tolerance, partial matching, CJK-friendly
- Partial indexes (WHERE is_deleted = false): smaller, faster
- No external service to operate, monitor, or pay for
- All standard PostgreSQL — works on Neon and any VPS

## Consequences

- English-only stemming by default (add CJK dictionary later if needed)
- GIN index adds ~5-10% storage overhead on notes table
- pg_trgm GIN index adds ~10-20% overhead on title data
- Both are partial indexes (active notes only), keeping overhead minimal
- Semantic/vector search can be added later via pgvector extension
