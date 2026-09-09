# ADR-015: Plugin Architecture (curated bundles first)

## Status

Accepted.

## Context

The vault surface is extensible by plugin, Obsidian community-plugin style.
Graph view ships as the first plugin. Arbitrary third-party code execution
requires real sandboxing; we are a Next.js web app, not an Electron webview.

## Decision

A first-class plugin API surface, loading **bundled, curated plugins from
the repository** — never `eval`/dynamic import of remote code. Registry +
enabled state in the database (`plugins` table), a manifest per plugin
(id, name, version), and a plugin API exposed to plugin modules:

- `registerView` — mount a plugin-owned pane in the workspace
- `addRibbonIcon` — ribbon button that reveals a view
- `registerCommand(id, name, run, hotkey?)` — command palette entry
- `registerEvent` — subscribe to vault events (open, save, metadata change)
- `addSettingTab` — plugin settings within the app settings
- `workspace.openNote / reveal`, `vault.getNote / updateNote / listNotes`

Untrusted third-party plugin installation is a documented follow-up, not
this phase.

## Alternatives considered

- **Dynamic remote plugin loading**: feature-complete but needs a real
  sandbox (iframe + capability broker + signature verification). Out of
  scope now; the API surface is designed so a loader can be added later
  without changing plugin-facing contracts.
- **No plugin system**: user-directed requirement is plugin-driven
  extensibility (graph, future tools).

## Reasoning

- Curated bundles prove the full API surface with zero security surface
- The API contracts (views, commands, events, vault access) are exactly
  what a future remote-loader needs, so no redesign later
- Graph-as-first-plugin proves the pattern end to end

## Consequences

- `plugins` table (workspace_id, id, enabled) + `plugins/` directory with
  manifests and modules
- Graph view is not in the core bundle; it is the reference plugin
- Sandboxed third-party loading is tracked in FUTURE.md