# API Specification

## Base

All endpoints are under `/api/`. Authentication required for all except
health check.

## Authentication

NextAuth v5 session-based. Session cookie sent with every request.
Route Handlers verify session via `auth()` helper.

## Response format

```json
{
  "data": { ... },
  "error": null
}
```

```json
{
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found"
  }
}
```

## Endpoints

### Notes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List notes (paginated, filterable) |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get note by ID |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Soft delete note |
| POST | `/api/notes/:id/restore` | Restore soft-deleted note |
| GET | `/api/notes/:id/backlinks` | Get backlinks to note |
| GET | `/api/notes/:id/links` | Get outgoing links from note |
| GET | `/api/notes/:id/revisions` | Get revision history |
| POST | `/api/notes/:id/revisions/:rev/restore` | Restore revision |

### Folders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/folders` | List folders (tree structure) |
| POST | `/api/folders` | Create folder |
| PATCH | `/api/folders/:id` | Update folder (rename) |
| DELETE | `/api/folders/:id` | Delete folder |

### Tags

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create tag |
| DELETE | `/api/tags/:id` | Delete tag |
| POST | `/api/notes/:id/tags` | Add tag to note |
| DELETE | `/api/notes/:id/tags/:tagId` | Remove tag from note |

### Search

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=...` | Full-text search |
| GET | `/api/search/fuzzy?q=...` | Fuzzy title search |

Query params: `q`, `tag`, `para`, `status`, `folder`, `project`, `before`, `after`, `limit`, `offset`

### Assets

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/assets/upload` | Get presigned R2 URL |
| GET | `/api/assets` | List assets |
| GET | `/api/assets/:id` | Get asset metadata |
| DELETE | `/api/assets/:id` | Delete asset |

### Projects (Phase 12)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PATCH | `/api/projects/:id` | Update project |

### Import/Export (Phase 08)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/import` | Import Markdown vault (ZIP) |
| GET | `/api/export` | Export vault as ZIP |

## Query parameters (notes list)

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search query |
| `tag` | string | Filter by tag name |
| `para` | enum | Filter by PARA category |
| `status` | enum | Filter by note status |
| `folder` | int | Filter by folder ID |
| `project` | uuid | Filter by project ID |
| `favorite` | boolean | Filter favorites only |
| `before` | ISO date | Notes updated before date |
| `after` | ISO date | Notes updated after date |
| `sort` | string | Sort field (default: updated_at) |
| `order` | enum | asc or desc (default: desc) |
| `limit` | int | Results per page (default: 20, max: 100) |
| `offset` | int | Pagination offset |

## Pagination

Cursor-based for infinite scroll, offset-based for page navigation.
Both supported via `limit` + `offset` params.

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```
