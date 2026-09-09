# ADR-014: Properties Source of Truth — note_properties Table

## Status

Accepted.

## Context

Obsidian keeps note properties as YAML frontmatter inside the `.md` file.
This project is server-first (postgres + API for a separate dashboard
project) with a 10k+ note performance budget: every properties read must
stay under ~500 ms p95, and per-note YAML parsing on read does not scale.

## Decision

`note_properties` (key + JSONB value, unique per note) is the source of
truth for note properties. YAML frontmatter is serialized only at import /
export boundaries (ADR-007), never parsed at runtime.

The properties panel (Stage 3) edits the table directly via the notes API.
Note reads return the properties in one aggregated query
(`json_agg` over `note_properties`), keeping note-open to a single round
trip.

## Alternatives considered

- **YAML inside `content` as truth**: requires parsing frontmatter on every
  open and every list query; needs a denormalized projection anyway to stay
  within the perf budget. Strictest 1:1 but the wrong trade for server-first.
- **Column-per-property**: schema churn per user property; no.

## Reasoning

- Indexed, unique, queryable; matches the ADR-011-era schema intent
- No runtime YAML dependency
- Export still yields Obsidian-format markdown (frontmatter injected at
  export time only)

## Consequences

- Properties are database rows; the raw markdown content contains no YAML
- Import (ADR-007) parses frontmatter once and backfills `note_properties`
- The Stage 3 YAML-file fidelity is limited to export; documented gap vs
  file-level 1:1, acceptable given the perf priority (user-confirmed)