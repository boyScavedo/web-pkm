# ADR-013: CodeMirror 6 Editor (supersedes ADR-002)

## Status

Accepted. Supersedes ADR-002.

## Context

The vault is now an Obsidian 1:1 product. Obsidian's actual writing
experience is a CodeMirror 6-based editor: source mode, live preview
(markdown syntax stays visible and formats in place), and a rendered
reading view. Three modes, no WYSIWYG hiding of syntax.

ADR-002 chose Tiptap v3 (ProseMirror WYSIWYG, Notion-style). That editing
feel is not Obsidian's and cannot be reconciled with the 1:1 requirement.

## Decision

CodeMirror 6 is the editor engine:

- `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`,
  `@codemirror/language`, `@codemirror/lang-markdown`,
  `@codemirror/search`
- Source mode = plain CM6 editing with markdown syntax highlighting
- Live preview = CM6 decorations/widgets rendering markdown in place
- Reading view = `markdown-it` rendered output (shared with export)

## Alternatives considered

- **Tiptap v3 (ADR-002)**: WYSIWYG; wrong editing model for Obsidian 1:1.
- **Milkdown**: ProseMirror WYSIWYG again; frontmatter gap historically.
- **MDXEditor / Plate / Lexical**: WYSIWYG models, same objection.

## Reasoning

- CM6 is exactly what Obsidian uses; fidelity comes from the engine choice
- Three modes (source / live preview / reading) fall out of one codebase
- Non-WYSIWYG is safer for canonical markdown round-trip (ADR-006)
- Active, well-maintained, no licensing constraints

## Consequences

- ADR-002 and its `@tiptap/markdown` / MarkedJS dependency plan are void
- Live preview is the long-pole build: inline decorations, block widgets,
  fold, images, math — staged as two merges in Stage 2 (see PHASE-03)
- `markdown-it` becomes the reading/render path and wikilink renderer
  (ADR-006 canonical markdown retained)