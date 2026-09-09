# ADR-002: Tiptap v3 Editor

## Status

Superseded by ADR-013 (CodeMirror 6 editor).

## Status history

**Accepted** in Phase 00 for a WYSIWYG markdown editor. **Superseded**
2026-09-09: the product became an Obsidian 1:1 vault, and Obsidian's writing
experience is CodeMirror 6 source / live preview / reading — not WYSIWYG.

## Context

We need a Markdown-first WYSIWYG editor that supports wikilinks, frontmatter,
code blocks, and persists as canonical Markdown.

## Decision

Use Tiptap v3 with `@tiptap/markdown` for bidirectional Markdown serialization.

## Alternatives considered

- **MDXEditor**: Excellent Markdown fidelity, frontmatter built-in, but smaller ecosystem, single primary maintainer, steeper plugin authoring curve.
- **Milkdown**: Frontmatter support is a known gap (open issue #1712). Dealbreaker for PKM.
- **Plate (Slate)**: Slate's document model is not markdown-native. Round-trip fidelity risk.
- **CodeMirror 6**: Perfect Markdown fidelity but no WYSIWYG. Good for "source mode" toggle, not primary editor.
- **Lexical (raw)**: Basic Markdown transformers. Too limited for PKM round-trip.

## Reasoning

- Largest ProseMirror ecosystem (10M+ weekly npm downloads)
- `@tiptap/markdown` uses MarkedJS, CommonMark-compliant bidirectional conversion
- Custom Node API with `parseMarkdown`/`renderMarkdown` hooks for wikilinks and frontmatter
- Headless architecture gives full UI control for the AMOLED black theme
- MIT license for editor core + markdown extension
- Active maintenance (v3.27.1 recent)
- Bundle: ~23KB core, ~165KB with markdown + starter kit + code blocks

## Consequences

- Will need custom Tiptap Node extensions for `[[wikilink]]` and YAML frontmatter (~50-100 lines each)
- `@tiptap/markdown` is labeled "early release" — may have edge cases with complex custom syntax
- Pro extensions mix of MIT and paid — we only need MIT ones
- If `@tiptap/markdown` proves inadequate, MDXEditor is the fallback (ADR-002b)
