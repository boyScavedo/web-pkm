# Entity Relationships

## Relationship diagram

```
users ─────< workspace_users >───── workspaces
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                 folders             notes              projects
                    │                   │                   │
                    │          ┌────────┼────────┐          │
                    │          │        │        │          │
                    │       note_tags  note_links  note_properties
                    │          │        │     │    │
                    │         tags    (self)   │
                    │                         │
                    │                    note_revisions
                    │
                 note_assets
                    │
                  assets
```

## Key relationships

| From | To | Cardinality | Table |
|------|----|-------------|-------|
| workspace → folder | 1:N | folders.workspace_id |
| workspace → note | 1:N | notes.workspace_id |
| workspace → tag | 1:N | tags.workspace_id |
| workspace → project | 1:N | projects.workspace_id |
| workspace → asset | 1:N | assets.workspace_id |
| folder → note | 1:N | notes.folder_id |
| folder → folder | 1:N (self) | folders.parent_id |
| note → tag | M:N | note_tags |
| note → note (links) | M:N (self) | note_links |
| note → note (revisions) | 1:N | note_revisions |
| note → asset | M:N | note_assets |
| note → property | 1:N | note_properties |
| project → note | M:N | project_notes |

## Cascade rules

All child tables use `ON DELETE CASCADE` from their parent.
- Deleting a note cascades: note_tags, note_links, note_revisions, note_properties, note_assets, project_notes
- Deleting a folder does NOT cascade to notes (notes get `folder_id = NULL` via `ON DELETE SET NULL`)
- Deleting a workspace cascades everything in that workspace

## Query patterns

### Backlinks (notes that link TO note X)
```sql
SELECT n.id, n.title, l.link_text
FROM note_links l
JOIN notes n ON n.id = l.source_note_id
WHERE l.target_note_id = $1;
```

### Outgoing links (notes linked FROM note X)
```sql
SELECT n.id, n.title, l.link_text, l.anchor
FROM note_links l
JOIN notes n ON n.id = l.target_note_id
WHERE l.source_note_id = $1;
```

### Graph traversal (3 hops from note X)
```sql
WITH RECURSIVE reachable AS (
  SELECT target_note_id, 1 AS depth
  FROM note_links WHERE source_note_id = $1
  UNION ALL
  SELECT l.target_note_id, r.depth + 1
  FROM note_links l
  JOIN reachable r ON l.source_note_id = r.target_note_id
  WHERE r.depth < 3
)
SELECT DISTINCT target_note_id FROM reachable;
```

### Folder subtree (all descendants)
```sql
SELECT n.id, n.title
FROM notes n
JOIN folders f ON f.id = n.folder_id
WHERE f.path <@ 'Projects.WebApp'::ltree;
```

### Notes by tag
```sql
SELECT n.id, n.title
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
WHERE nt.tag_id = $1 AND n.is_deleted = false
ORDER BY n.updated_at DESC;
```

### Combined search + tag
```sql
SELECT n.id, n.title, ts_rank(n.search_vector, q) AS rank
FROM notes n, plainto_tsquery('english', 'postgresql indexes') q
JOIN note_tags nt ON nt.note_id = n.id
WHERE n.search_vector @@ q
  AND nt.tag_id = 42
  AND n.is_deleted = false
ORDER BY rank DESC;
```
