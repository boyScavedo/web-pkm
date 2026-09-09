# Database Schema

## Extensions required

```sql
CREATE EXTENSION IF NOT EXISTS ltree;     -- folder hierarchy
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- fuzzy search
-- gen_random_uuid() built into PG13+ core, no extension needed
```

## Enums

```sql
CREATE TYPE para_category AS ENUM ('inbox', 'project', 'area', 'resource', 'archive');
CREATE TYPE note_status AS ENUM ('inbox', 'draft', 'evergreen', 'archived');
```

## Tables

### users
```sql
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL UNIQUE,
  name        text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

### workspaces
```sql
CREATE TABLE workspaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

### workspace_users
```sql
CREATE TABLE workspace_users (
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'owner',
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);
```

### folders
```sql
CREATE TABLE folders (
  id            serial PRIMARY KEY,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  path          ltree NOT NULL,
  parent_id     int REFERENCES folders(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, path)
);
CREATE INDEX idx_folders_path ON folders USING gist(path);
CREATE INDEX idx_folders_workspace ON folders(workspace_id);
```

### notes
```sql
CREATE TABLE notes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id     int REFERENCES folders(id) ON DELETE SET NULL,
  title         text NOT NULL,
  content       text NOT NULL DEFAULT '',
  format        text NOT NULL DEFAULT 'markdown',
  para          para_category NOT NULL DEFAULT 'resource',
  status        note_status NOT NULL DEFAULT 'draft',
  is_favorite   boolean NOT NULL DEFAULT false,
  is_template   boolean NOT NULL DEFAULT false,
  is_deleted    boolean NOT NULL DEFAULT false,
  deleted_at    timestamptz,
  slug          text,
  cover_image   text,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

### tags
```sql
CREATE TABLE tags (
  id            serial PRIMARY KEY,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  color         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, name)
);
```

### note_tags
```sql
CREATE TABLE note_tags (
  note_id  uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id   int NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

### note_links
```sql
CREATE TABLE note_links (
  source_note_id  uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id  uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  link_text       text,
  anchor          text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source_note_id, target_note_id)
);
```

### note_properties
```sql
CREATE TABLE note_properties (
  id          bigserial PRIMARY KEY,
  note_id     uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  key         text NOT NULL,
  value       jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (note_id, key)
);
```

### note_revisions
```sql
CREATE TABLE note_revisions (
  id          bigserial PRIMARY KEY,
  note_id     uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title       text NOT NULL,
  content     text NOT NULL,
  revision    int NOT NULL,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (note_id, revision)
);
```

### assets
```sql
CREATE TABLE assets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  storage_key       text NOT NULL,
  original_filename text NOT NULL,
  mime_type         text NOT NULL,
  size              bigint NOT NULL,
  width             int,
  height            int,
  checksum          text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

### note_assets
```sql
CREATE TABLE note_assets (
  note_id   uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  asset_id  uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  position  int NOT NULL DEFAULT 0,
  PRIMARY KEY (note_id, asset_id)
);
```

### projects
```sql
CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          text NOT NULL,
  status        text NOT NULL DEFAULT 'active',
  outcome       text,
  deadline      timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

### project_notes
```sql
CREATE TABLE project_notes (
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  note_id     uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'reference',
  PRIMARY KEY (project_id, note_id)
);
```

## Indexes

```sql
-- Notes: core lookups
CREATE INDEX idx_notes_folder ON notes (folder_id, created_at DESC)
  INCLUDE (title, status, updated_at, is_favorite);
CREATE INDEX idx_notes_para ON notes (para, created_at DESC)
  WHERE is_deleted = false;
CREATE INDEX idx_notes_status ON notes (status, updated_at DESC)
  WHERE is_deleted = false;
CREATE INDEX idx_notes_workspace ON notes (workspace_id, updated_at DESC);

-- Notes: partial (small, fast)
CREATE INDEX idx_notes_favorites ON notes (updated_at DESC)
  WHERE is_favorite = true AND is_deleted = false;
CREATE INDEX idx_notes_inbox ON notes (created_at DESC)
  WHERE status = 'inbox' AND is_deleted = false;

-- Notes: search (GIN, partial)
CREATE INDEX idx_notes_search ON notes USING GIN (search_vector)
  WHERE is_deleted = false;
CREATE INDEX idx_notes_title_trgm ON notes USING GIN (title gin_trgm_ops)
  WHERE is_deleted = false;

-- Tags
CREATE INDEX idx_note_tags_tag ON note_tags (tag_id);

-- Links
CREATE INDEX idx_links_target ON note_links (target_note_id);

-- Revisions
CREATE INDEX idx_revisions_note ON note_revisions (note_id, revision DESC);

-- Assets
CREATE INDEX idx_assets_workspace ON assets (workspace_id, created_at DESC);

-- Projects
CREATE INDEX idx_project_notes_note ON project_notes (note_id);

-- Note properties
CREATE INDEX idx_note_properties_note ON note_properties (note_id);
```

## Trigger: auto-revision

```sql
CREATE OR REPLACE FUNCTION save_note_revision() RETURNS trigger AS $$
BEGIN
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
    INSERT INTO note_revisions (note_id, title, content, revision)
    SELECT NEW.id, NEW.title, NEW.content,
      COALESCE((SELECT max(revision) + 1 FROM note_revisions WHERE note_id = NEW.id), 1);
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_note_revision
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION save_note_revision();
```

## Storage estimate

| Component | 5K notes × 5KB | 10K notes × 8KB |
|-----------|----------------|-----------------|
| Notes (TOAST compressed) | ~9MB | ~27MB |
| Revisions (20 per note) | ~20MB | ~40MB |
| search_vector (stored) | ~5MB | ~9MB |
| GIN tsvector index | ~4MB | ~8MB |
| GIN trigram index (titles) | ~6MB | ~12MB |
| All other indexes | ~3MB | ~5MB |
| Metadata rows | ~2MB | ~3MB |
| **Total** | **~49MB** | **~104MB** |

Within 0.5GB Neon limit with 70%+ headroom.
