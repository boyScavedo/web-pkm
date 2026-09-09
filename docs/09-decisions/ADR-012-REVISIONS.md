# ADR-012: Full Snapshot Revisions

## Status

Accepted

## Context

We need note revision history for a single-user PKM. Balance between
storage cost and simplicity.

## Decision

Store full snapshot of note content on each significant edit. Trigger-based
auto-creation. Retention cap of 20 revisions per note.

## Alternatives considered

- **Diff-based storage**: Store first snapshot + deltas. Saves ~60-70% storage but read path is slower (apply diffs sequentially), code is more complex. Not worth it at PKM scale.
- **Git-like content-addressable storage**: Maximum deduplication, but complex implementation. Overkill for single-user.
- **No revisions**: Simplest, but losing note history is unacceptable.

## Reasoning

- Full snapshots: simple query (`SELECT * FROM note_revisions WHERE note_id = X ORDER BY revision DESC`)
- At 5K notes × 20 revisions × 5KB average: ~20MB storage (compressed)
- PostgreSQL TOAST compresses Markdown to ~30% of raw size
- Trigger-based: no application code needed for revision creation
- Retention cap prevents unbounded growth

## Consequences

- Trigger fires on UPDATE when content or title changes
- `updated_at` auto-bumped by the same trigger
- Retention cleanup: simple DELETE query, run periodically or on note save
- Revision restore: copy revision content back to note, create new revision
- Storage cost is manageable within 0.5GB Neon limit
