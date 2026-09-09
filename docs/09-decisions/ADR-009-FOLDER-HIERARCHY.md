# ADR-009: ltree Folder Hierarchy

## Status

Accepted

## Context

We need hierarchical folders with efficient subtree and ancestor queries.

## Decision

Use PostgreSQL `ltree` extension for folder paths.

## Alternatives considered

- **Adjacency list + recursive CTE**: Simpler, no extension needed, but recursive queries for subtree/ancestor. Fine at PKM scale but verbose.
- **Closure table**: Fast reads both directions, but O(n²) storage and complex maintenance. Overkill.
- **Nested sets**: Fast reads, very expensive moves. Bad fit for folders that occasionally get reorganized.

## Reasoning

- `ltree` is a core PostgreSQL contrib extension, available on all standard installs
- Trusted extension — no superuser needed to install
- `<@` operator for "is descendant of" — single index lookup
- `@>` operator for "is ancestor of" — breadcrumbs
- GiST index for pattern matching
- Folders rarely move — ltree's moderate move cost is acceptable
- One `CREATE EXTENSION ltree` on VPS migration

## Consequences

- Extension must be created before schema (`CREATE EXTENSION IF NOT EXISTS ltree`)
- Folder paths are dot-separated (e.g., `Projects.WebApp.Frontend`)
- Folder rename = update path + all descendant paths (one query with `textreplace`)
- At PKM scale (< 1000 folders), even adjacency list would work — ltree is chosen for clean query syntax
