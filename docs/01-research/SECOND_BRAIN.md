# Second Brain / Progressive Summarization

## Overview

Tiago Forte's concept of building an external system to store and organize
knowledge. Progressive summarization is the technique for distilling notes
over time.

## Progressive summarization layers

1. **Original capture** — raw note, no processing
2. **First pass** — bold the most important passages
3. **Second pass** — highlight the best of the bold
4. **Third pass** — executive summary in own words
5. **Remix** — transform into output (blog, video, project plan)

## What we take

- **Layered refinement** — notes evolve from capture to evergreen
- **`status` field tracks progression**: inbox → draft → evergreen
- **Output-ready knowledge** — the PKM feeds content creation, not just storage

## What we skip

- Formal "progressive summarization" UI with toggle-able layers (Obsidian plugins do this, but it adds UI complexity for marginal value over just editing the note)
- Bold/highlight as first-class data structures (they're just Markdown formatting)

## Implementation

- `status` enum: `inbox | draft | evergreen | archived`
- Notes naturally progress through statuses as they're refined
- Evergreen notes are the high-value, distilled knowledge
- The search and dashboard surface evergreen notes prominently
