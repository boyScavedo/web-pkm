# Product Specification

## What web-pkm is

A personal knowledge management system and operating environment for a single
developer. It serves as the canonical data layer for all personal information:
knowledge, projects, content, goals, and decisions.

## What web-pkm is not

- Not a note-taking app (it's an infrastructure)
- Not a collaboration tool (single user)
- Not a social platform
- Not a generic SaaS dashboard

## Core features (by phase)

### Phase 01-08: PKM Core
- Create, read, update, delete notes
- Markdown editing with WYSIWYG (Tiptap)
- Folder hierarchy (ltree)
- Tags and properties
- Wikilinks and backlinks
- Full-text search
- Fuzzy title search
- Tag-filtered search
- PARA classification
- Asset upload (R2)
- Import/export (Markdown vault)
- Soft delete and restore

### Phase 09: Dashboard
- Inbox (unprocessed captures)
- Recent notes
- Active projects
- Favorites
- Orphan notes (no links in or out)
- Broken links
- Review queue

### Phase 10: Revisions
- Note history (auto-saved on edit)
- Browse revisions
- Restore revision

### Phase 11: PKM API
- RESTful endpoints for all operations
- API documentation
- Mobile-client ready

### Phase 12: Projects
- Project CRUD
- Project notes
- Milestones and tasks
- Project dashboard

### Phase 13: Content Creation OS
- Content items
- Pipeline stages
- Content calendar
- Repurposing tracking

### Phase 14: Life OS
- Goals
- Areas
- Weekly review
- Daily journal

### Phase 15: Command Center
- Unified view answering: What has my attention? What am I working on?
  What do I need to do? What am I learning?

## User experience goals

- Fast (sub-second for all common operations)
- Dense (useful density over decorative whitespace)
- Keyboard-friendly (command palette, shortcuts)
- Technical aesthetic (terminal/editor feel)
- Calm (high contrast, minimal animation, no noise)
- Searchable (find anything in < 2 seconds)
- Portable (export at any time)
