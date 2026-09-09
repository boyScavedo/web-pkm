# PKM Specification

## Entities

### Note
The fundamental unit of knowledge. A note is Markdown content with metadata.

**Properties**: id, title, content (Markdown), format, para, status, is_favorite,
is_template, is_deleted, slug, cover_image, folder_id, workspace_id,
created_at, updated_at, search_vector (generated).

**Statuses**: inbox → draft → evergreen → archived

**PARA**: inbox | project | area | resource | archive

### Folder
Organizational container with hierarchical path (ltree).

**Properties**: id, workspace_id, name, path (ltree), parent_id, created_at.

### Tag
Label for topic-based classification.

**Properties**: id, workspace_id, name, color.

### Note-Tag junction
Links notes to tags. Many-to-many.

### Note-Link
Wikilink relationship between notes. Self-referencing many-to-many with metadata.

**Properties**: source_note_id, target_note_id, link_text, anchor, created_at.

### Note-Property
User-defined structured metadata beyond core columns.

**Properties**: id, note_id, key, value (jsonb), created_at.

### Note-Revision
Historical snapshot of note content. Auto-created on edit via trigger.

**Properties**: id, note_id, title, content, revision, metadata, created_at.

### Asset
Binary file metadata. Actual file lives in R2.

**Properties**: id, workspace_id, storage_key, original_filename, mime_type,
size, width, height, checksum, created_at.

### Note-Asset junction
Links notes to assets. Many-to-many with position.

### Project
Active effort with outcome and deadline. References PKM notes.

**Properties**: id, workspace_id, name, status, outcome, deadline,
created_at, updated_at.

### Project-Note junction
Links projects to notes with a role (overview, task, reference, decision).

## Workflows

### Capture → Process → Organize
1. Quick capture creates note with `status: inbox`, `para: inbox`
2. User processes inbox, assigns PARA, sets status to `draft`
3. Note is linked to related notes and tagged

### Note lifecycle
```
inbox → draft → evergreen → archived
              ↗ (promote)   ↗ (demote)
```

### Link lifecycle
1. User types `[[Note Title]]` in editor
2. On save, wikilinks are parsed, resolved to note IDs
3. `note_links` rows created for each resolved link
4. Unresolved links tracked as broken links
5. When target note is renamed, all `note_links` rows updated

### Search lifecycle
1. Note content changes
2. `search_vector` generated column auto-updates
3. GIN index auto-maintains
4. Search queries use GIN index for speed

## Storage budget

At 5,000 notes × 5KB average: ~35MB total (data + indexes).
At 10,000 notes × 8KB average: ~65MB total.
Comfortable within 0.5GB Neon limit with 70%+ headroom.

## Migration readiness

- All extensions: standard PostgreSQL (ltree, pg_trgm)
- All types: standard SQL (uuid, text, int, timestamptz, jsonb, ltree)
- ORM: Drizzle generates portable SQL migrations
- Driver: Neon serverless driver works with any PostgreSQL
- Process: `pg_dump -Fc` → `pg_restore --no-owner` → `CREATE EXTENSION`
