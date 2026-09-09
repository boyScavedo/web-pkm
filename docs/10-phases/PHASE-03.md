# Phase 03 — Obsidian 1:1 Vault Base

## Status: IN PROGRESS

Stage 0-1 (frame + foundations, file explorer + folders API) complete;
stages 03.2-03.8 below.

## Objective

Rebuild the vault UI as an Obsidian 1:1 product on the existing server-first
API: frame, file explorer, CodeMirror 6 writing experience (source / live
preview / reading), properties panel, wikilinks/backlinks, search, a plugin
framework with the graph view as its first plugin, and a public API for the
separate dashboard project.

## Decisions (ADRs)

- ADR-013 — CodeMirror 6 editor, three modes (supersedes ADR-002/Tiptap)
- ADR-014 — properties source of truth = `note_properties`; YAML only at
  import/export
- ADR-015 — plugin framework, curated bundles first; graph = reference plugin
- Obsidian 1:1 frame (ribbon | explorer | tabs | editor | outline/backlinks |
  status bar); PARA removed from the vault UI (columns/API remain for the
  dashboard project)
- Black/mono theme retained (no theme system this phase)

## Performance budget (10k+ notes, p95)

| Operation | Target |
|-----------|--------|
| Note open | < 300 ms (one aggregated query incl. properties) |
| File tree load | < 300 ms |
| Search | < 200 ms |
| Graph data | < 500 ms (bounded query + degree pruning) |

Each stage ships a load-bench integration test seeding ~10k synthetic notes.

## Stages

### 03.1 Frame + foundations — COMPLETE
- ADRs 013/014/015; OBSIDIAN_ANALYSIS + DESIGN_SYSTEM + FUTURE overwritten
- Vault frame on the (app) layout: Ribbon, FileExplorer (empty state),
  TabStrip, StatusBar; `(app)/page.tsx` = vault home
- Retired Sidebar/Topbar (PARA + system nav) and its Unicode glyphs
- Legacy notes/folders/tags/projects routes still reachable by URL for the
  transition; new-note action links there until the editor lands (03.3)
- E2E: auth.spec rewritten for the vault; vault.spec added; notes.spec edited

### 03.2 File explorer + folders API — COMPLETE
- Service `folders.ts`: create/rename/delete (ltree subtree), move (re-path),
  tree assembly from flat rows
- API: GET/POST `/api/folders`, PATCH/DELETE `/api/folders/[id]` (ADR-008)
- Explorer: collapsible tree, folder actions, note rows, move dialog,
  "new note / new folder" per folder
- Tests: unit (tree build, ltree re-path, subtree delete), integration,
  E2E (folder → note → rename → move → delete)

### 03.3 Editor — CodeMirror 6 (long pole, two merges)
- Deps: `@codemirror/{state,view,commands,language,lang-markdown,search}`,
  `markdown-it` (reading view + wikilink rule)
- Merge A: source + reading view, tabs, dirty tracking, debounced autosave
  → PATCH `/api/notes/:id`; title = filename (rename re-targets note_links)
- Merge B: live preview — inline decorations, block widgets, fold,
  images, math
- Spike-first; E2E: type markdown → live format → reload → persisted

### 03.4 Properties panel
- Service + API on `note_properties`: aggregated in note read; batch upsert /
  delete route
- UI: properties section above the note, "+ new metadata", typed rows
  (text/number/date/list/checkbox/tag-link), reorder, delete
- js-yaml serialization only for export/import
- Tests: unit (type normalization), integration (upsert/delete/aggregate
  shape/uniqueness), E2E (add/edit/remove persists)

### 03.5 Wikilinks, backlinks, outline
- Migration: `note_links.target_note_id` nullable + `resolved` (ADR-011
  broken-link tracking)
- Save-time parse (`[[x]]`, `[[x|alt]]`, `[[x#heading]]`) → upsert links;
  implement `/api/notes/:id/backlinks` + `/links` (API_SPEC)
- UI: CM6 `[[` completion, backlinks pane, outline from headings
- Tests: unit (parser incl. aliases/unicode), integration (sync, rename
  re-target, broken links), E2E (autocomplete → backlink appears)

### 03.6 Search + quick switcher
- FTS + fuzzy + tag/folder filters on existing indexes;
  `/api/search`, `/api/search/fuzzy`
- ⌘P command palette, ⌘O quick switcher
- Tests: unit (query builder), integration (FTS/trigram), E2E (switcher opens)

### 03.7 Plugin framework + graph view
- `plugins` table + manifests + curated bundles; plugin API (registerView,
  addRibbonIcon, registerCommand, registerEvent, addSettingTab,
  workspace.openNote/reveal, vault.*, onMetadataChange) — ADR-015
- Graph plugin (reference): d3-force SVG, node size/degree + highlight,
  edges from note_links, click → open note, local/full, degree-pruned render
  above ~1500 nodes
- Tests: unit (manifest validation), integration (graph endpoint), E2E
  (enable plugin → ribbon pane → nodes → click navigates)

### 03.8 Public API for the dashboard project
- `api_tokens` (scopes) + Bearer path in requireUser (session OR token),
  CORS allowlist for the dashboard origin
- API_SPEC endpoint pass: folders/tags/search/backlinks/links/properties/
  graph/revisions consistent + documented
- Tests: unit (token/scope), integration (token-authed round trip)

## Workflow

Each stage: `feature/*` branch → unit + integration + E2E → squash PR → dev →
dev→main PR reopens. Docs updated every stage (CHANGELOG, CURRENT_STATE,
KNOWN_ISSUES). Gate: `npm run typecheck && npm run lint` + green CI.

## Risks

- Live preview (03.3) is the long pole — de-risked by spike-first merges
- 10k-node graph render — degree pruning + bounded query
- Plugin scope creep — curated bundles only; sandboxing tracked separately